const crypto = require('crypto');
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Service = require('../models/Service');
const Offer = require('../models/Offer');
const Order = require('../models/Order');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../middleware/errors');
const { releaseOrder } = require('../services/ledger');
const { writeAudit } = require('../services/audit');

const orderNumber = () => `KOBO-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const feeFor = (amountMinor) => Math.round(amountMinor * Number(process.env.PLATFORM_FEE_BPS || 500) / 10_000);
const transition = (order, to, actorId, reason = '') => { order.transitions.push({ from: order.status, to, actorId, reason }); order.status = to; };

const create = asyncHandler(async (req, res) => {
  if (!req.user.phoneVerifiedAt) throw new ApiError(403, 'PHONE_VERIFICATION_REQUIRED', 'Verify your phone before creating an order');
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      let subject;
      if (req.body.subjectType === 'listing') {
        subject = await Listing.findOneAndUpdate(
          { _id: req.body.subjectId, isActive: true, lifecycleStatus: 'active', quantity: { $gt: 0 } },
          [{ $set: { quantity: { $subtract: ['$quantity', 1] }, lifecycleStatus: { $cond: [{ $eq: ['$quantity', 1] }, 'reserved', '$lifecycleStatus'] } } }],
          { new: true, session }
        );
      } else {
        subject = await Service.findOne({ _id: req.body.subjectId, isActive: true }).session(session);
      }
      if (!subject) throw new ApiError(404, 'ORDER_SUBJECT_NOT_FOUND', 'This item or service is no longer available');
      if (subject.fulfilmentMethods?.length && !subject.fulfilmentMethods.includes(req.body.fulfilmentMethod)) throw new ApiError(400, 'FULFILMENT_METHOD_UNAVAILABLE', 'Choose a fulfilment method offered for this item or service');
      const sellerId = subject.sellerId || subject.providerId;
      if (String(sellerId) === String(req.user._id)) throw new ApiError(400, 'ORDER_SELF_PURCHASE', 'You cannot buy your own item or service');
      if (!await User.exists({ _id: sellerId, phoneVerifiedAt: { $ne: null }, isBanned: false }).session(session)) throw new ApiError(409, 'SELLER_NOT_VERIFIED', 'This seller must verify their phone before accepting protected orders');
      let itemAmountMinor = subject.priceMinor ?? Math.round(subject.price * 100);
      let offer = null;
      if (req.body.offerId) {
        offer = await Offer.findOne({ _id: req.body.offerId, subjectType: req.body.subjectType, subjectId: req.body.subjectId, status: 'accepted' }).session(session);
        if (!offer || ![offer.createdBy, offer.recipientId].some((id) => String(id) === String(req.user._id))) throw new ApiError(400, 'ORDER_OFFER_INVALID', 'The accepted offer could not be used');
        itemAmountMinor = offer.amountMinor;
      }
      const platformFeeMinor = feeFor(itemAmountMinor);
      [order] = await Order.create([{ orderNumber: orderNumber(), buyerId: req.user._id, sellerId, subjectType: req.body.subjectType, subjectId: subject._id, offerId: offer?._id || null, inventoryReserved: req.body.subjectType === 'listing', snapshot: { title: subject.title, description: subject.description, image: subject.images?.[0] || '' }, itemAmountMinor, platformFeeMinor, totalMinor: itemAmountMinor + platformFeeMinor, fulfilmentMethod: req.body.fulfilmentMethod, transitions: [{ from: 'created', to: 'pending_payment', actorId: req.user._id, reason: '' }] }], { session });
      await writeAudit({ req, action: 'order.created', targetType: 'order', targetId: order._id, metadata: { orderNumber: order.orderNumber }, session });
    });
  } finally { await session.endSession(); }
  res.status(201).json(order);
});

const list = asyncHandler(async (req, res) => {
  const orders = await Order.find({ $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }] }).sort({ createdAt: -1 }).lean();
  res.json({ orders });
});

const detail = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
  if (![order.buyerId, order.sellerId].some((id) => String(id) === String(req.user._id)) && req.user.role !== 'admin') throw new ApiError(403, 'ORDER_FORBIDDEN', 'You do not have access to this order');
  res.json(order);
});

const changeStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
  const isBuyer = String(order.buyerId) === String(req.user._id);
  const isSeller = String(order.sellerId) === String(req.user._id);
  const rules = {
    accept: { from: 'paid', to: 'accepted', allowed: isSeller },
    mark_fulfilled: { from: 'accepted', to: 'fulfilled', allowed: isSeller },
    confirm_complete: { from: 'fulfilled', to: 'completed', allowed: isBuyer },
    cancel: { from: 'pending_payment', to: 'cancelled', allowed: isBuyer || isSeller },
  };
  const rule = rules[req.body.action];
  if (!rule.allowed) throw new ApiError(403, 'ORDER_TRANSITION_FORBIDDEN', 'You cannot perform this order action');
  if (order.status !== rule.from) throw new ApiError(409, 'ORDER_TRANSITION_INVALID', `Order must be ${rule.from.replaceAll('_', ' ')} first`);

  if (rule.to === 'completed') {
    const session = await mongoose.startSession();
    try { await session.withTransaction(async () => { transition(order, rule.to, req.user._id, req.body.reason); order.completedAt = new Date(); await order.save({ session }); if (order.inventoryReserved) await Listing.updateOne({ _id: order.subjectId }, { $set: { lifecycleStatus: 'sold', isActive: false } }, { session }); await releaseOrder({ order, session }); await writeAudit({ req, action: 'order.completed', targetType: 'order', targetId: order._id, session }); }); }
    finally { await session.endSession(); }
  } else {
    transition(order, rule.to, req.user._id, req.body.reason);
    if (rule.to === 'accepted') order.acceptedAt = new Date();
    if (rule.to === 'fulfilled') order.fulfilledAt = new Date();
    if (rule.to === 'cancelled') order.cancelledAt = new Date();
    if (rule.to === 'cancelled' && order.inventoryReserved) {
      const cancelSession = await mongoose.startSession();
      try {
        await cancelSession.withTransaction(async () => {
          await order.save({ session: cancelSession });
          await Listing.updateOne({ _id: order.subjectId }, { $inc: { quantity: 1 }, $set: { lifecycleStatus: 'active', isActive: true } }, { session: cancelSession });
          await writeAudit({ req, action: `order.${rule.to}`, targetType: 'order', targetId: order._id, session: cancelSession });
        });
      } finally { await cancelSession.endSession(); }
    } else {
      await order.save();
      await writeAudit({ req, action: `order.${rule.to}`, targetType: 'order', targetId: order._id });
    }
  }
  res.json(order);
});

module.exports = { changeStatus, create, detail, list };
