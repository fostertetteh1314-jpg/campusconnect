const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true, maxlength: 2000 },
  urls: [{ type: String, maxlength: 500 }],
  submittedAt: { type: Date, default: Date.now },
}, { _id: false });

const disputeSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, maxlength: 2000 },
  status: { type: String, enum: ['open', 'under_review', 'resolved_buyer', 'resolved_seller', 'closed'], default: 'open', index: true },
  evidence: { type: [evidenceSchema], default: [] },
  resolutionNote: { type: String, maxlength: 2000, default: '' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
