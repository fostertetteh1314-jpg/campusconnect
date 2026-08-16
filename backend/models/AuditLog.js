const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, immutable: true },
  action: { type: String, required: true, immutable: true, index: true },
  targetType: { type: String, required: true, immutable: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, default: null, immutable: true },
  requestId: { type: String, default: '', immutable: true },
  ipHash: { type: String, default: '', immutable: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {}, immutable: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('AuditLog', auditLogSchema);
