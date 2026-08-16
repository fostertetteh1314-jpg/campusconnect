const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, immutable: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 1000, default: '' },
  status: { type: String, enum: ['published', 'hidden'], default: 'published' },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
