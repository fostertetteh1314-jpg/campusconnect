const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amountMinor: { type: Number, required: true, min: 1 },
  currency: { type: String, enum: ['GHS'], default: 'GHS' },
  destination: { provider: { type: String, required: true }, accountName: { type: String, required: true }, accountMask: { type: String, required: true } },
  status: { type: String, enum: ['requested', 'approved', 'processing', 'paid', 'failed', 'rejected'], default: 'requested', index: true },
  idempotencyKey: { type: String, required: true, unique: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  failureReason: { type: String, maxlength: 500, default: '' },
  recipientCode: { type: String, default: '' },
  transferReference: { type: String, default: '', index: true },
  transferCode: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
