require('./helpers');
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../app');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const PaymentEvent = require('../models/PaymentEvent');
const LedgerTransaction = require('../models/LedgerTransaction');
const WalletAccount = require('../models/WalletAccount');
const User = require('../models/User');
const moolre = require('../services/moolre');
const { userPayload } = require('./helpers');

const app = createApp();
const providerAmounts = new Map();
moolre.checkPayment = async (reference) => ({ status: 1, code: 'SS01', data: { txstatus: 1, externalref: reference, transactionid: `payment-${reference}`, amount: String(providerAmounts.get(reference) / 100) } });
moolre.checkTransfer = async (reference) => ({ status: 1, code: 'SS01', data: { txstatus: 1, externalref: reference, transactionid: `transfer-${reference}`, amount: String(providerAmounts.get(reference) / 100) } });

const register = async (suffix) => (await request(app).post('/api/auth/register').send(userPayload(suffix)).expect(201)).body;
const auth = (user) => ({ Authorization: `Bearer ${user.token}` });

const paidOrder = async (buyer, seller, amount = 85) => {
  await User.updateMany({ _id: { $in: [buyer._id, seller._id] } }, { $set: { phoneVerifiedAt: new Date() } });
  const listing = await Listing.create({ title: 'Calculus textbook', description: 'Second edition in good condition', price: amount, category: 'Textbooks', condition: 'Good', contactNumber: seller.phone, sellerId: seller._id });
  const order = (await request(app).post('/api/v1/orders').set(auth(buyer)).send({ subjectType: 'listing', subjectId: listing._id, fulfilmentMethod: 'campus_pickup' }).expect(201)).body;
  const reference = `KOBO-test-${order._id}`;
  await Order.updateOne({ _id: order._id }, { $set: { payment: { provider: 'moolre', reference, providerId: 'test', network: 'MTN', payerMask: '***0000', status: 'pending', initializedAt: new Date() } } });
  providerAmounts.set(reference, order.totalMinor);
  await request(app).post(`/api/v1/orders/${order._id}/payment/status`).set(auth(buyer)).expect(200);
  return { order: await Order.findById(order._id), listing, reference };
};

test('phone verification codes are one-time and verify the authenticated phone', async () => {
  const user = await register('verify-phone');
  const requested = await request(app).post('/api/v1/verifications/phone/request').set(auth(user)).expect(201);
  assert.match(requested.body.testCode, /^\d{6}$/);
  await request(app).post('/api/v1/verifications/phone/confirm').set(auth(user)).send({ code: requested.body.testCode }).expect(200);
  assert.ok((await User.findById(user._id)).phoneVerifiedAt);
  await request(app).post('/api/v1/verifications/phone/confirm').set(auth(user)).send({ code: requested.body.testCode }).expect(400);
});

test('conversations authorize participants and support accepted integer-pesewa offers', async () => {
  const buyer = await register('conversation-buyer');
  const seller = await register('conversation-seller');
  const stranger = await register('conversation-stranger');
  const listing = await Listing.create({ title: 'Scientific calculator', description: 'Working calculator with protective cover', price: 120, category: 'Calculators', condition: 'Good', contactNumber: seller.phone, sellerId: seller._id });
  const conversation = (await request(app).post('/api/v1/conversations').set(auth(buyer)).send({ participantId: seller._id, contextType: 'listing', contextId: listing._id }).expect(201)).body;
  await request(app).get(`/api/v1/conversations/${conversation._id}`).set(auth(stranger)).expect(403);
  const offer = (await request(app).post(`/api/v1/conversations/${conversation._id}/offers`).set(auth(buyer)).send({ recipientId: seller._id, subjectType: 'listing', subjectId: listing._id, amountMinor: 10000, note: 'Can we meet at main campus?', expiresInHours: 24 }).expect(201)).body;
  const accepted = await request(app).patch(`/api/v1/conversations/offers/${offer._id}`).set(auth(seller)).send({ action: 'accept' }).expect(200);
  assert.equal(accepted.body.status, 'accepted');
});

test('verified Moolre status reconciliation is idempotent and creates balanced immutable ledger entries', async () => {
  const buyer = await register('payment-buyer');
  const seller = await register('payment-seller');
  const result = await paidOrder(buyer, seller);
  assert.equal(result.order.status, 'paid');
  await request(app).post(`/api/v1/orders/${result.order._id}/payment/status`).set(auth(buyer)).expect(200);
  assert.equal(await PaymentEvent.countDocuments({ orderId: result.order._id }), 1);
  const ledger = await LedgerTransaction.find({ orderId: result.order._id });
  assert.equal(ledger.length, 1);
  assert.equal(ledger[0].entries.reduce((sum, entry) => sum + entry.debitMinor, 0), ledger[0].entries.reduce((sum, entry) => sum + entry.creditMinor, 0));
});

test('fulfilment confirmation releases the seller amount once and enables one verified review', async () => {
  const buyer = await register('complete-buyer');
  const seller = await register('complete-seller');
  const { order } = await paidOrder(buyer, seller, 85);
  await request(app).patch(`/api/v1/orders/${order._id}/status`).set(auth(seller)).send({ action: 'accept', reason: '' }).expect(200);
  await request(app).patch(`/api/v1/orders/${order._id}/status`).set(auth(seller)).send({ action: 'mark_fulfilled', reason: '' }).expect(200);
  const completed = await request(app).patch(`/api/v1/orders/${order._id}/status`).set(auth(buyer)).send({ action: 'confirm_complete', reason: '' }).expect(200);
  assert.equal(completed.body.status, 'completed');
  const wallet = await WalletAccount.findOne({ sellerId: seller._id });
  assert.equal(wallet.availableMinor, 8500);
  assert.equal((await Listing.findById(order.subjectId)).lifecycleStatus, 'sold');
  await request(app).post('/api/v1/reviews').set(auth(buyer)).send({ orderId: order._id, rating: 5, comment: 'Item matched the listing.' }).expect(201);
  await request(app).post('/api/v1/reviews').set(auth(buyer)).send({ orderId: order._id, rating: 5, comment: '' }).expect(409);
});

test('disputes hold funds and withdrawals reserve available seller balance idempotently', async () => {
  const buyer = await register('wallet-buyer');
  const seller = await register('wallet-seller');
  const first = await paidOrder(buyer, seller, 100);
  await request(app).patch(`/api/v1/orders/${first.order._id}/status`).set(auth(seller)).send({ action: 'accept', reason: '' }).expect(200);
  await request(app).patch(`/api/v1/orders/${first.order._id}/status`).set(auth(seller)).send({ action: 'mark_fulfilled', reason: '' }).expect(200);
  await request(app).patch(`/api/v1/orders/${first.order._id}/status`).set(auth(buyer)).send({ action: 'confirm_complete', reason: '' }).expect(200);
  const withdrawalBody = { amountMinor: 6000, provider: 'MTN', accountName: 'Account holder', idempotencyKey: 'withdrawal-test-0001' };
  const withdrawal = await request(app).post('/api/v1/wallet/withdrawals').set(auth(seller)).send(withdrawalBody).expect(201);
  await request(app).post('/api/v1/wallet/withdrawals').set(auth(seller)).send(withdrawalBody).expect(200);
  const wallet = await WalletAccount.findOne({ sellerId: seller._id });
  assert.equal(wallet.availableMinor, 4000); assert.equal(wallet.pendingWithdrawalMinor, 6000);
  assert.equal(await LedgerTransaction.countDocuments({ withdrawalId: withdrawal.body._id }), 1);
  const transferReference = `kobo_wd_${withdrawal.body._id}`;
  await require('../models/Withdrawal').updateOne({ _id: withdrawal.body._id }, { $set: { status: 'processing', transferReference } });
  providerAmounts.set(transferReference, 6000);
  await request(app).post('/api/v1/payments/webhooks/moolre').send({ status: 1, code: 'P01', data: { externalref: transferReference } }).expect(200);
  const paidWallet = await WalletAccount.findOne({ sellerId: seller._id });
  assert.equal(paidWallet.availableMinor, 4000); assert.equal(paidWallet.pendingWithdrawalMinor, 0);
  assert.equal(await LedgerTransaction.countDocuments({ withdrawalId: withdrawal.body._id }), 2);

  const second = await paidOrder(buyer, seller, 50);
  const dispute = await request(app).post('/api/v1/disputes').set(auth(buyer)).send({ orderId: second.order._id, reason: 'The seller and I need help resolving fulfilment.', evidenceUrls: [] }).expect(201);
  assert.equal(dispute.body.status, 'open');
  assert.equal((await Order.findById(second.order._id)).status, 'disputed');
});
