const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  familyId: { type: String, required: true, index: true, immutable: true },
  tokenHash: { type: String, required: true, unique: true, immutable: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  revokedAt: { type: Date, default: null },
  replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },
  userAgentHash: { type: String, default: '' },
  ipHash: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
