const mongoose = require('mongoose');

const transitionSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reason: { type: String, maxlength: 500, default: '' },
  at: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, immutable: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true, index: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true, index: true },
  subjectType: { type: String, enum: ['listing', 'service'], required: true, immutable: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, required: true, immutable: true },
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null, immutable: true },
  inventoryReserved: { type: Boolean, default: false, immutable: true },
  snapshot: {
    title: { type: String, required: true, immutable: true },
    description: { type: String, required: true, immutable: true },
    image: { type: String, default: '', immutable: true },
  },
  itemAmountMinor: { type: Number, required: true, min: 1, immutable: true },
  platformFeeMinor: { type: Number, required: true, min: 0, immutable: true },
  totalMinor: { type: Number, required: true, min: 1, immutable: true },
  currency: { type: String, enum: ['GHS'], default: 'GHS', immutable: true },
  fulfilmentMethod: { type: String, enum: ['campus_pickup', 'public_meetup', 'delivery', 'digital'], required: true },
  status: { type: String, enum: ['pending_payment', 'paid', 'accepted', 'fulfilled', 'completed', 'disputed', 'cancelled', 'refund_pending', 'refunded'], default: 'pending_payment', index: true },
  transitions: { type: [transitionSchema], default: [] },
  paidAt: { type: Date, default: null },
  acceptedAt: { type: Date, default: null },
  fulfilledAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  payment: {
    provider: { type: String, enum: ['', 'moolre'], default: '' },
    reference: { type: String, default: '', index: true },
    providerId: { type: String, default: '' },
    network: { type: String, enum: ['', 'MTN', 'TELECEL', 'AT'], default: '' },
    payerMask: { type: String, default: '' },
    status: { type: String, default: '' },
    initializedAt: { type: Date, default: null },
  },
  refund: {
    providerId: { type: String, default: '' },
    status: { type: String, default: '' },
    amountMinor: { type: Number, min: 0, default: 0 },
    initiatedAt: { type: Date, default: null },
  },
}, { timestamps: true });

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });
orderSchema.index({ subjectType: 1, subjectId: 1 });

module.exports = mongoose.model('Order', orderSchema);
