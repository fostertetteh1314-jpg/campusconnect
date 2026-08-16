const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  participantKey: { type: String, required: true },
  contextType: { type: String, enum: ['listing', 'service', 'order', 'general'], default: 'general' },
  contextId: { type: mongoose.Schema.Types.ObjectId, default: null },
  lastMessageAt: { type: Date, default: Date.now },
  archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ contextType: 1, contextId: 1 });
conversationSchema.index({ participantKey: 1, contextType: 1, contextId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
