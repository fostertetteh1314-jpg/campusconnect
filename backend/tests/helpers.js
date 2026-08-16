const { before, after, afterEach } = require('node:test');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MOOLRE_API_USER = 'test-user';
process.env.MOOLRE_PUBLIC_KEY = 'test-public-key';
process.env.MOOLRE_PRIVATE_KEY = 'test-private-key';
process.env.MOOLRE_ACCOUNT_NUMBER = '100000100002';
process.env.OTP_PROVIDER = 'test';

let mongo;

before(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 }, instanceOpts: [{ launchTimeout: 60_000 }] });
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

const userPayload = (suffix = 'one') => ({
  name: `Test User ${suffix}`,
  email: `${suffix}@example.com`,
  password: 'safe-password-123',
  department: 'Computer Science',
  level: '300',
  phone: `024${String(Math.abs([...suffix].reduce((total, char) => total + char.charCodeAt(0), 0))).padStart(7, '0').slice(-7)}`,
});

module.exports = { userPayload };
