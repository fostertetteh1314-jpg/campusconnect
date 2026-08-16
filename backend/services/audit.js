const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

const hashIp = (ip) => crypto.createHash('sha256').update(`${process.env.AUDIT_IP_SALT || 'kobo-audit'}:${ip || ''}`).digest('hex');

const writeAudit = ({ req, action, targetType, targetId = null, metadata = {}, session = null }) => AuditLog.create([{
  actorId: req.user?._id || null,
  action,
  targetType,
  targetId,
  requestId: req.id || '',
  ipHash: hashIp(req.ip),
  metadata,
}], session ? { session } : undefined);

module.exports = { writeAudit };
