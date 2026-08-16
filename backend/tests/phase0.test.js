require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const http = require('http');
const { Server } = require('socket.io');
const { io: createClient } = require('socket.io-client');
const createApp = require('../app');
const initSocket = require('../socket/socket');
const Listing = require('../models/Listing');
const Message = require('../models/Message');
const Service = require('../models/Service');
const { userPayload } = require('./helpers');

const app = createApp();

const register = async (suffix) => {
  const response = await request(app).post('/api/auth/register').send(userPayload(suffix)).expect(201);
  return response.body;
};

test('health responses include security headers and a request ID', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.requestId, response.headers['x-request-id']);
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
});

test('CORS allows configured origins and rejects unconfigured origins', async () => {
  await request(app).get('/api/health').set('Origin', 'http://localhost:5173').expect(200).expect('access-control-allow-origin', 'http://localhost:5173');
  const denied = await request(app).get('/api/health').set('Origin', 'https://attacker.example').expect(403);
  assert.equal(denied.body.error.code, 'CORS_ORIGIN_DENIED');
});

test('registration validates fields and normalizes email', async () => {
  const invalid = await request(app).post('/api/auth/register').send({ name: 'A' }).expect(400);
  assert.equal(invalid.body.error.code, 'VALIDATION_FAILED');
  assert.ok(invalid.body.error.requestId);

  const payload = userPayload('normal');
  const created = await request(app).post('/api/auth/register').send({ ...payload, email: '  NORMAL@EXAMPLE.COM ' }).expect(201);
  assert.equal(created.body.email, 'normal@example.com');
  assert.ok(created.body.phone.startsWith('+233'));
  assert.ok(created.body.token);

  const duplicate = userPayload('duplicate-format');
  const equivalentPhone = `+233${payload.phone.slice(1)}`;
  const conflict = await request(app).post('/api/auth/register').send({ ...duplicate, phone: equivalentPhone }).expect(409);
  assert.equal(conflict.body.error.code, 'ACCOUNT_EXISTS');
});

test('refresh sessions rotate in HTTP-only cookies and replay revokes the token family', async () => {
  const registered = await request(app).post('/api/auth/register').send(userPayload('refresh-session')).expect(201);
  const originalCookie = registered.headers['set-cookie'][0].split(';')[0];
  assert.match(registered.headers['set-cookie'][0], /HttpOnly/i);
  const rotated = await request(app).post('/api/auth/refresh').set('Cookie', originalCookie).set('X-KOBO-Refresh', '1').expect(200);
  const replacementCookie = rotated.headers['set-cookie'][0].split(';')[0];
  assert.notEqual(originalCookie, replacementCookie);
  await request(app).post('/api/auth/refresh').set('Cookie', originalCookie).set('X-KOBO-Refresh', '1').expect(401);
  await request(app).post('/api/auth/refresh').set('Cookie', replacementCookie).set('X-KOBO-Refresh', '1').expect(401);
});

test('unsafe MongoDB-style keys are rejected before a controller runs', async () => {
  const response = await request(app).post('/api/auth/login').send({ email: { $ne: null }, password: 'anything' }).expect(400);
  assert.equal(response.body.error.code, 'UNSAFE_INPUT');
});

test('a user cannot update another seller listing', async () => {
  const owner = await register('owner');
  const intruder = await register('intruder');
  const listing = await Listing.create({
    title: 'Calculus textbook', description: 'Second edition in good condition', price: 85,
    category: 'Textbooks', condition: 'Good', contactNumber: owner.phone, sellerId: owner._id,
  });

  const response = await request(app)
    .put(`/api/listings/${listing._id}`)
    .set('Authorization', `Bearer ${intruder.token}`)
    .send({ title: 'Changed title', description: 'This update must not be allowed', price: 1, category: 'Textbooks', condition: 'Good', contactNumber: intruder.phone })
    .expect(403);

  assert.equal(response.body.error.code, 'LISTING_FORBIDDEN');
  assert.equal((await Listing.findById(listing._id)).title, 'Calculus textbook');
});

test('service updates reject mass-assigned ownership and moderation fields', async () => {
  const owner = await register('provider');
  const other = await register('other');
  const service = await Service.create({
    title: 'Statistics tutoring', description: 'One-to-one help with core statistics concepts', price: 60,
    category: 'Tutorials', contactNumber: owner.phone, providerId: owner._id,
  });

  const response = await request(app)
    .put(`/api/services/${service._id}`)
    .set('Authorization', `Bearer ${owner.token}`)
    .send({ title: service.title, description: service.description, price: 60, category: 'Tutorials', contactNumber: owner.phone, providerId: other._id, isFlagged: false })
    .expect(400);

  assert.equal(response.body.error.code, 'VALIDATION_FAILED');
  assert.equal((await Service.findById(service._id)).providerId.toString(), owner._id);
});

test('ordinary users cannot access admin resources', async () => {
  const user = await register('member');
  const response = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${user.token}`).expect(403);
  assert.equal(response.body.error.code, 'ADMIN_REQUIRED');
});

test('Socket.IO rejects anonymous clients and never trusts a client sender ID', async () => {
  const sender = await register('socket-sender');
  const receiver = await register('socket-receiver');
  const httpServer = http.createServer();
  const io = new Server(httpServer);
  initSocket(io);
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${httpServer.address().port}`;

  const anonymousError = await new Promise((resolve, reject) => {
    const client = createClient(url, { transports: ['websocket'], reconnection: false, timeout: 2_000 });
    const timer = setTimeout(() => reject(new Error('Anonymous socket was not rejected')), 3_000);
    client.on('connect_error', (error) => {
      clearTimeout(timer);
      client.close();
      resolve(error);
    });
  });
  assert.equal(anonymousError.message, 'Authentication required');

  const result = await new Promise((resolve, reject) => {
    const client = createClient(url, { transports: ['websocket'], reconnection: false, auth: { token: sender.token } });
    const timer = setTimeout(() => reject(new Error('Authenticated socket timed out')), 4_000);
    client.on('connect_error', reject);
    client.on('connect', () => {
      client.emit('sendMessage', { receiverId: receiver._id, senderId: receiver._id, message: 'Authenticated hello' }, (acknowledgement) => {
        clearTimeout(timer);
        client.close();
        resolve(acknowledgement);
      });
    });
  });

  assert.equal(result.ok, true);
  const stored = await Message.findById(result.message._id);
  assert.equal(stored.senderId.toString(), sender._id);
  assert.equal(stored.receiverId.toString(), receiver._id);
  await new Promise((resolve) => io.close(resolve));
});
