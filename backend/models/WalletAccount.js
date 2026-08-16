const mongoose = require('mongoose');

const walletAccountSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currency: { type: String, enum: ['GHS'], default: 'GHS' },
  availableMinor: { type: Number, min: 0, default: 0 },
  pendingWithdrawalMinor: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('WalletAccount', walletAccountSchema);
