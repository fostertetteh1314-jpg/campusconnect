const mongoose = require('mongoose');

const phoneVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  phone: { type: String, required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  attempts: { type: Number, default: 0 },
  consumedAt: { type: Date, default: null },
}, { timestamps: true });

phoneVerificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PhoneVerification', phoneVerificationSchema);
