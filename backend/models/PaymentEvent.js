const mongoose = require('mongoose');

const paymentEventSchema = new mongoose.Schema({
  provider: { type: String, enum: ['moolre'], required: true },
  eventKey: { type: String, required: true, unique: true, immutable: true },
  reference: { type: String, required: true, index: true, immutable: true },
  eventType: { type: String, required: true, immutable: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null, index: true, immutable: true },
  withdrawalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Withdrawal', default: null, index: true, immutable: true },
  amountMinor: { type: Number, required: true, min: 0, immutable: true },
  currency: { type: String, required: true, immutable: true },
  providerStatus: { type: String, required: true, immutable: true },
  payloadHash: { type: String, required: true, immutable: true },
  processedAt: { type: Date, default: Date.now, immutable: true },
}, { timestamps: true });

module.exports = mongoose.model('PaymentEvent', paymentEventSchema);
