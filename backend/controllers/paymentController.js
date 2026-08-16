const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const PaymentEvent = require('../models/PaymentEvent');
const Withdrawal = require('../models/Withdrawal');
const WalletAccount = require('../models/WalletAccount');
const { ApiError, asyncHandler } = require('../middleware/errors');
const moolre = require('../services/moolre');
const { createLedgerTransaction, postPayment } = require('../services/ledger');
const { writeAudit } = require('../services/audit');

const matchesAmount = (providerAmount, amountMinor) => moolre.minorAmount(providerAmount) === amountMinor;
const payloadHash = (payload) => crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

const postConfirmedPayment = async ({ order, provider }) => {
  if (!moolre.isSuccessful(provider)) throw new ApiError(409, 'PAYMENT_NOT_CONFIRMED', 'The mobile money payment is not confirmed yet');
  if (String(provider.data.externalref) !== order.payment.reference || !matchesAmount(provider.data.amount, order.totalMinor)) throw new ApiError(400, 'PAYMENT_MISMATCH', 'Payment details do not match the order');
  const eventKey = `moolre:payment:${provider.data.transactionid || order.payment.reference}`;
  if (await PaymentEvent.exists({ eventKey })) return order;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const current = await Order.findById(order._id).session(session);
      if (await PaymentEvent.exists({ eventKey }).session(session)) return;
      await PaymentEvent.create([{ provider: 'moolre', eventKey, reference: current.payment.reference, eventType: 'payment.success', orderId: current._id, amountMinor: current.totalMinor, currency: current.currency, providerStatus: String(provider.data.txstatus), payloadHash: payloadHash(provider) }], { session });
      if (current.status === 'pending_payment') {
        current.transitions.push({ from: current.status, to: 'paid', actorId: null, reason: 'Confirmed with Moolre status API' });
        current.status = 'paid'; current.paidAt = new Date(); current.payment.status = 'success'; current.payment.providerId = String(provider.data.transactionid || '');
        await current.save({ session });
        await postPayment({ order: current, eventKey, session });
      }
    });
  } finally { await session.endSession(); }
  return Order.findById(order._id);
};

const postConfirmedTransfer = async ({ withdrawal, provider }) => {
  if (!moolre.isSuccessful(provider)) return false;
  if (String(provider.data.externalref) !== withdrawal.transferReference || !matchesAmount(provider.data.amount, withdrawal.amountMinor)) throw new ApiError(400, 'TRANSFER_MISMATCH', 'Transfer details do not match the withdrawal');
  const eventKey = `moolre:transfer:${provider.data.transactionid || withdrawal.transferReference}`;
  if (await PaymentEvent.exists({ eventKey })) return true;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const current = await Withdrawal.findById(withdrawal._id).session(session);
      if (!current || current.status !== 'processing' || await PaymentEvent.exists({ eventKey }).session(session)) return;
      await PaymentEvent.create([{ provider: 'moolre', eventKey, reference: current.transferReference, eventType: 'transfer.success', withdrawalId: current._id, amountMinor: current.amountMinor, currency: current.currency, providerStatus: String(provider.data.txstatus), payloadHash: payloadHash(provider) }], { session });
      current.status = 'paid'; current.transferCode = String(provider.data.transactionid || ''); await current.save({ session });
      await WalletAccount.updateOne({ sellerId: current.sellerId }, { $inc: { pendingWithdrawalMinor: -current.amountMinor } }, { session });
      await createLedgerTransaction({ idempotencyKey: `withdrawal:paid:${current._id}`, kind: 'withdrawal', withdrawalId: current._id, session, entries: [{ account: `liability:withdrawal:${current._id}:pending`, debitMinor: current.amountMinor }, { account: 'asset:moolre_receivable', creditMinor: current.amountMinor }] });
    });
  } finally { await session.endSession(); }
  return true;
};

const initialize = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
  if (String(order.buyerId) !== String(req.user._id)) throw new ApiError(403, 'PAYMENT_FORBIDDEN', 'Only the buyer can start payment');
  if (order.status !== 'pending_payment') throw new ApiError(409, 'PAYMENT_NOT_PENDING', 'This order is not waiting for payment');
  const reference = order.payment?.reference || `KOBO-${String(order._id)}-${crypto.randomBytes(5).toString('hex')}`;
  const provider = await moolre.initiateCollection({ amountMinor: order.totalMinor, externalReference: reference, network: req.body.network, otpCode: req.body.otpCode, phone: req.body.phone });
  order.payment = { provider: 'moolre', reference, providerId: typeof provider.data === 'string' ? provider.data : '', network: req.body.network, payerMask: `***${req.body.phone.slice(-4)}`, status: provider.code === 'TP14' ? 'otp_required' : 'pending', initializedAt: new Date() };
  await order.save();
  await writeAudit({ req, action: 'payment.initialized', targetType: 'order', targetId: order._id, metadata: { reference, providerCode: provider.code } });
  res.json({ reference, providerCode: provider.code, message: provider.message || 'Approve the payment prompt on your phone.', otpRequired: provider.code === 'TP14' });
});

const status = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
  if (![order.buyerId, order.sellerId].some((id) => String(id) === String(req.user._id)) && req.user.role !== 'admin') throw new ApiError(403, 'ORDER_FORBIDDEN', 'You do not have access to this order');
  if (!order.payment?.reference) throw new ApiError(409, 'PAYMENT_NOT_STARTED', 'Start the mobile money payment first');
  const provider = await moolre.checkPayment(order.payment.reference);
  const updated = await postConfirmedPayment({ order, provider });
  res.json({ confirmed: updated.status !== 'pending_payment', order: updated });
});

const webhook = asyncHandler(async (req, res) => {
  const reference = String(req.body?.data?.externalref || req.body?.externalref || '');
  if (!reference) throw new ApiError(400, 'WEBHOOK_REFERENCE_MISSING', 'Callback reference is required');
  const order = await Order.findOne({ 'payment.reference': reference });
  if (order) { await postConfirmedPayment({ order, provider: await moolre.checkPayment(reference) }); return res.status(200).json({ received: true }); }
  const withdrawal = await Withdrawal.findOne({ transferReference: reference });
  if (withdrawal) { await postConfirmedTransfer({ withdrawal, provider: await moolre.checkTransfer(reference) }); return res.status(200).json({ received: true }); }
  return res.status(200).json({ received: true, matched: false });
});

module.exports = { initialize, postConfirmedTransfer, status, webhook };
