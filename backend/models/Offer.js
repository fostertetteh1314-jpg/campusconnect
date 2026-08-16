const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectType: { type: String, enum: ['listing', 'service'], required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amountMinor: { type: Number, required: true, min: 1, max: Number.MAX_SAFE_INTEGER },
  currency: { type: String, enum: ['GHS'], default: 'GHS' },
  note: { type: String, trim: true, maxlength: 500, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'withdrawn', 'expired'], default: 'pending', index: true },
  expiresAt: { type: Date, required: true },
  respondedAt: { type: Date, default: null },
}, { timestamps: true });

offerSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Offer', offerSchema);
