const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const { ApiError, asyncHandler } = require('../middleware/errors');
const { normalizeGhanaPhone } = require('../utils/phone');

const cookieName = 'kobo_refresh';
const refreshDays = () => Math.min(90, Math.max(1, Number(process.env.REFRESH_TOKEN_DAYS || 30)));
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: process.env.JWT_ACCESS_TTL || '15m' });
const randomToken = () => crypto.randomBytes(48).toString('base64url');
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const fingerprint = (value) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(value || '').digest('hex');
const parseCookies = (header = '') => Object.fromEntries(header.split(';').map((part) => part.trim()).filter(Boolean).map((part) => { const index = part.indexOf('='); return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))]; }));
const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/api/auth', maxAge: refreshDays() * 24 * 60 * 60 * 1000 });
const clearCookieOptions = () => { const { maxAge: _maxAge, ...options } = cookieOptions(); return options; };
const publicUser = (user) => ({ _id: user._id, name: user.name, email: user.email, department: user.department, level: user.level, phone: user.phone, profileImage: user.profileImage, role: user.role, phoneVerifiedAt: user.phoneVerifiedAt });

const createSession = async ({ userId, req, familyId = crypto.randomUUID() }) => {
  const token = randomToken();
  const session = await Session.create({ userId, familyId, tokenHash: hash(token), expiresAt: new Date(Date.now() + refreshDays() * 24 * 60 * 60 * 1000), userAgentHash: fingerprint(req.get('user-agent')), ipHash: fingerprint(req.ip) });
  return { session, token };
};

const issue = async ({ user, req, res }) => {
  const { token: refreshToken } = await createSession({ userId: user._id, req });
  res.cookie(cookieName, refreshToken, cookieOptions());
  return { ...publicUser(user), token: generateToken(user._id) };
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, level } = req.body;
  const phone = normalizeGhanaPhone(req.body.phone);
  if (await User.exists({ $or: [{ email }, { phone }] })) throw new ApiError(409, 'ACCOUNT_EXISTS', 'An account already uses that email or phone number');
  const user = await User.create({ name, email, password, department, level, phone });
  res.status(201).json(await issue({ user, req, res }));
});

const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await user.matchPassword(req.body.password))) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  if (user.isBanned) throw new ApiError(403, 'ACCOUNT_SUSPENDED', 'Account has been suspended');
  res.json(await issue({ user, req, res }));
});

const refresh = asyncHandler(async (req, res) => {
  if (req.get('x-kobo-refresh') !== '1') throw new ApiError(400, 'REFRESH_HEADER_REQUIRED', 'Refresh request header is required');
  const rawToken = parseCookies(req.headers.cookie)[cookieName];
  if (!rawToken) throw new ApiError(401, 'REFRESH_REQUIRED', 'Sign in to continue');
  const existing = await Session.findOne({ tokenHash: hash(rawToken) });
  if (!existing) throw new ApiError(401, 'REFRESH_INVALID', 'Your session is invalid');
  if (existing.revokedAt) { await Session.updateMany({ familyId: existing.familyId, revokedAt: null }, { $set: { revokedAt: new Date() } }); res.clearCookie(cookieName, clearCookieOptions()); throw new ApiError(401, 'REFRESH_REUSED', 'This session was revoked for safety'); }
  if (existing.expiresAt <= new Date()) { existing.revokedAt = new Date(); await existing.save(); res.clearCookie(cookieName, clearCookieOptions()); throw new ApiError(401, 'REFRESH_EXPIRED', 'Sign in again to continue'); }
  const claimed = await Session.findOneAndUpdate({ _id: existing._id, revokedAt: null }, { $set: { revokedAt: new Date() } }, { new: true });
  if (!claimed) { await Session.updateMany({ familyId: existing.familyId, revokedAt: null }, { $set: { revokedAt: new Date() } }); throw new ApiError(401, 'REFRESH_REUSED', 'This session was revoked for safety'); }
  const user = await User.findById(existing.userId);
  if (!user || user.isBanned) throw new ApiError(401, 'REFRESH_USER_INVALID', 'Sign in again to continue');
  const replacement = await createSession({ userId: user._id, req, familyId: existing.familyId });
  claimed.replacedBy = replacement.session._id; await claimed.save();
  res.cookie(cookieName, replacement.token, cookieOptions());
  res.json({ ...publicUser(user), token: generateToken(user._id) });
});

const logout = asyncHandler(async (req, res) => {
  const rawToken = parseCookies(req.headers.cookie)[cookieName];
  if (rawToken) await Session.updateOne({ tokenHash: hash(rawToken), revokedAt: null }, { $set: { revokedAt: new Date() } });
  res.clearCookie(cookieName, clearCookieOptions());
  res.status(204).end();
});

const getProfile = async (req, res) => res.json(req.user);

const updateProfile = asyncHandler(async (req, res) => {
  const phone = normalizeGhanaPhone(req.body.phone);
  if (await User.exists({ phone, _id: { $ne: req.user._id } })) throw new ApiError(409, 'PHONE_IN_USE', 'That phone number is already in use');
  const update = { name: req.body.name, department: req.body.department, level: req.body.level, phone };
  if (phone !== req.user.phone) update.phoneVerifiedAt = null;
  if (req.file) update.profileImage = req.file.path;
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true }).select('-password');
  res.json(user);
});

module.exports = { getProfile, login, logout, refresh, register, updateProfile };
