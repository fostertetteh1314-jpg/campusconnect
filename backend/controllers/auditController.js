const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errors');

const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
  const [logs, total] = await Promise.all([AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('actorId', 'name email').lean(), AuditLog.countDocuments()]);
  res.json({ logs, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

module.exports = { list };
