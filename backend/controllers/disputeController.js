const mongoose = require('mongoose');
const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../middleware/errors');
const { releaseOrder } = require('../services/ledger');
const { writeAudit } = require('../services/audit');
const moolre = require('../services/moolre');
const { createLedgerTransaction } = require('../services/ledger');

const create = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
  if (![order.buyerId, order.sellerId].some((id) => String(id) === String(req.user._id))) throw new ApiError(403, 'DISPUTE_FORBIDDEN', 'Only an order participant can open a dispute');
  if (!['paid', 'accepted', 'fulfilled'].includes(order.status)) throw new ApiError(409, 'DISPUTE_ORDER_INVALID', 'This order cannot be disputed at its current stage');
  let dispute;
  try { dispute = await Dispute.create({ orderId: order._id, openedBy: req.user._id, reason: req.body.reason, evidence: req.body.evidenceUrls.length ? [{ submittedBy: req.user._id, description: req.body.reason, urls: req.body.evidenceUrls }] : [] }); }
  catch (error) { if (error.code === 11000) throw new ApiError(409, 'DISPUTE_EXISTS', 'A dispute is already open for this order'); throw error; }
  order.transitions.push({ from: order.status, to: 'disputed', actorId: req.user._id, reason: req.body.reason }); order.status = 'disputed'; await order.save();
  await writeAudit({ req, action: 'dispute.opened', targetType: 'dispute', targetId: dispute._id, metadata: { orderId: String(order._id) } });
  res.status(201).json(dispute);
});

const addEvidence = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id).populate('orderId');
  if (!dispute) throw new ApiError(404, 'DISPUTE_NOT_FOUND', 'Dispute not found');
  if (![dispute.orderId.buyerId, dispute.orderId.sellerId].some((id) => String(id) === String(req.user._id))) throw new ApiError(403, 'DISPUTE_FORBIDDEN', 'You cannot add evidence to this dispute');
  if (!['open', 'under_review'].includes(dispute.status)) throw new ApiError(409, 'DISPUTE_CLOSED', 'This dispute no longer accepts evidence');
  dispute.evidence.push({ submittedBy: req.user._id, description: req.body.description, urls: req.body.urls }); await dispute.save(); res.json(dispute);
});

const listMine = asyncHandler(async (req, res) => {
  const orders = await Order.find({ $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }] }).select('_id');
  const disputes = await Dispute.find({ orderId: { $in: orders.map((order) => order._id) } }).sort({ createdAt: -1 }).lean();
  res.json({ disputes });
});

const listAll = asyncHandler(async (_req, res) => {
  const disputes = await Dispute.find().sort({ createdAt: -1 }).populate('openedBy', 'name email').populate('orderId', 'orderNumber totalMinor status snapshot').lean();
  res.json({ disputes });
});

const resolve = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw new ApiError(404, 'DISPUTE_NOT_FOUND', 'Dispute not found');
  if (!['open', 'under_review'].includes(dispute.status)) throw new ApiError(409, 'DISPUTE_CLOSED', 'This dispute has already been resolved');
  const refundOrder = req.body.resolution === 'buyer' ? await Order.findById(dispute.orderId) : null;
  let refund = null;
  let refundReference = '';
  if (refundOrder) {
    if (!refundOrder.payment?.reference) throw new ApiError(409, 'REFUND_PAYMENT_MISSING', 'The original provider payment could not be found');
    const buyer = await User.findById(refundOrder.buyerId);
    if (!buyer?.phoneVerifiedAt || !refundOrder.payment.network) throw new ApiError(409, 'REFUND_DESTINATION_MISSING', 'The buyer needs a verified mobile money destination');
    refundReference = `kobo_rf_${refundOrder._id}`;
    refund = await moolre.initiateTransfer({ amountMinor: refundOrder.totalMinor, externalReference: refundReference, network: refundOrder.payment.network, phone: buyer.phone, reference: `KOBO refund ${refundOrder.orderNumber}` });
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(dispute.orderId).session(session);
      if (req.body.resolution === 'buyer') {
        const refunded = moolre.isSuccessful(refund);
        order.transitions.push({ from: order.status, to: refunded ? 'refunded' : 'refund_pending', actorId: req.user._id, reason: req.body.note }); order.status = refunded ? 'refunded' : 'refund_pending';
        order.refund = { providerId: refundReference, status: refunded ? 'success' : 'pending', amountMinor: order.totalMinor, initiatedAt: new Date() };
        if (refunded) {
          if (order.inventoryReserved) await Listing.updateOne({ _id: order.subjectId }, { $inc: { quantity: 1 }, $set: { lifecycleStatus: 'active', isActive: true } }, { session });
          await createLedgerTransaction({ idempotencyKey: `refund:order:${order._id}`, kind: 'refund', orderId: order._id, session, entries: [{ account: `liability:order:${order._id}:held`, debitMinor: order.totalMinor }, { account: 'asset:moolre_receivable', creditMinor: order.totalMinor }] });
        }
        dispute.status = 'resolved_buyer';
      } else if (req.body.resolution === 'seller') {
        order.transitions.push({ from: order.status, to: 'completed', actorId: req.user._id, reason: req.body.note }); order.status = 'completed'; order.completedAt = new Date();
        if (order.inventoryReserved) await Listing.updateOne({ _id: order.subjectId }, { $set: { lifecycleStatus: 'sold', isActive: false } }, { session });
        await releaseOrder({ order, session }); dispute.status = 'resolved_seller';
      } else { dispute.status = 'closed'; }
      dispute.resolutionNote = req.body.note; dispute.resolvedBy = req.user._id; dispute.resolvedAt = new Date();
      await order.save({ session }); await dispute.save({ session }); await writeAudit({ req, action: `dispute.${dispute.status}`, targetType: 'dispute', targetId: dispute._id, session });
    });
  } finally { await session.endSession(); }
  res.json(dispute);
});

module.exports = { addEvidence, create, listAll, listMine, resolve };
