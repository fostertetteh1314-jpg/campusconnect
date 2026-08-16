const crypto = require('crypto');
const PhoneVerification = require('../models/PhoneVerification');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../middleware/errors');
const { writeAudit } = require('../services/audit');
const { sendVerificationCode } = require('../services/sms');

const hashCode = (verificationId, code) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${verificationId}:${code}`).digest('hex');

const requestCode = asyncHandler(async (req, res) => {
  if (req.user.phoneVerifiedAt) return res.json({ verified: true });
  const latest = await PhoneVerification.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  if (latest && latest.createdAt > new Date(Date.now() - 60_000)) throw new ApiError(429, 'OTP_RATE_LIMITED', 'Wait one minute before requesting another code');
  const code = String(crypto.randomInt(100000, 1000000));
  const verification = new PhoneVerification({ userId: req.user._id, phone: req.user.phone, codeHash: 'pending', expiresAt: new Date(Date.now() + 10 * 60_000) });
  verification.codeHash = hashCode(verification._id, code);
  await verification.save();
  try {
    await sendVerificationCode({ phone: req.user.phone, code });
  } catch (error) {
    await verification.deleteOne();
    req.log?.error({ error: error.message, userId: req.user._id }, 'OTP delivery failed');
    throw new ApiError(503, 'OTP_PROVIDER_UNAVAILABLE', 'Phone verification is temporarily unavailable');
  }
  res.status(201).json({ sent: true, expiresAt: verification.expiresAt, ...(process.env.NODE_ENV === 'test' ? { testCode: code } : {}) });
});

const confirmCode = asyncHandler(async (req, res) => {
  const verification = await PhoneVerification.findOne({ userId: req.user._id, consumedAt: null }).sort({ createdAt: -1 });
  if (!verification || verification.expiresAt <= new Date()) throw new ApiError(400, 'OTP_EXPIRED', 'Request a new verification code');
  if (verification.attempts >= 5) throw new ApiError(429, 'OTP_ATTEMPTS_EXCEEDED', 'Request a new verification code');
  const matches = crypto.timingSafeEqual(Buffer.from(verification.codeHash, 'hex'), Buffer.from(hashCode(verification._id, req.body.code), 'hex'));
  if (!matches) { verification.attempts += 1; await verification.save(); throw new ApiError(400, 'OTP_INVALID', 'The verification code is incorrect'); }
  verification.consumedAt = new Date();
  await Promise.all([verification.save(), User.updateOne({ _id: req.user._id }, { $set: { phoneVerifiedAt: new Date() } })]);
  await writeAudit({ req, action: 'phone.verified', targetType: 'user', targetId: req.user._id });
  res.json({ verified: true });
});

module.exports = { confirmCode, requestCode };
