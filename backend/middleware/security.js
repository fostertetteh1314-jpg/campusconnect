const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { ApiError } = require('./errors');

const rejectUnsafeKeys = (value, path = 'request') => {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      throw new ApiError(400, 'UNSAFE_INPUT', `Unsafe field in ${path}`);
    }
    rejectUnsafeKeys(child, `${path}.${key}`);
  }
};

const sanitizeRequest = (req, _res, next) => {
  try {
    rejectUnsafeKeys(req.body, 'body');
    rejectUnsafeKeys(req.params, 'params');
    rejectUnsafeKeys(req.query, 'query');
    next();
  } catch (error) {
    next(error);
  }
};

const limiter = (windowMs, limit, code) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test' || process.env.RATE_LIMIT_DISABLED === 'true',
  handler: (req, res) => res.status(429).json({
    message: 'Too many requests. Please try again later.',
    error: { code, message: 'Too many requests. Please try again later.', requestId: req.id },
  }),
});

const apiLimiter = limiter(15 * 60 * 1000, 300, 'RATE_LIMITED');
const authLimiter = limiter(15 * 60 * 1000, 20, 'AUTH_RATE_LIMITED');
const messageLimiter = limiter(60 * 1000, 60, 'MESSAGE_RATE_LIMITED');
const uploadLimiter = limiter(15 * 60 * 1000, 30, 'UPLOAD_RATE_LIMITED');

const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
});

module.exports = { apiLimiter, authLimiter, messageLimiter, sanitizeRequest, securityHeaders, uploadLimiter };
