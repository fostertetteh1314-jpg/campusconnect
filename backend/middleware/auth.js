const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('./errors');

const protect = asyncHandler(async (req, _res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) throw new ApiError(401, 'AUTH_USER_NOT_FOUND', 'User not found');
      if (req.user.isBanned) throw new ApiError(403, 'ACCOUNT_SUSPENDED', 'Account has been suspended');
      return next();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'INVALID_TOKEN', 'Your session is invalid or has expired');
    }
  }
  throw new ApiError(401, 'AUTH_REQUIRED', 'Sign in to continue');
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return next(new ApiError(403, 'ADMIN_REQUIRED', 'Admin access required'));
};

module.exports = { protect, adminOnly };
