const { ZodError } = require('zod');

class ApiError extends Error {
  constructor(status, code, message, fieldErrors) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

const errorBody = (req, code, message, fieldErrors) => ({
  message,
  error: {
    code,
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
    requestId: req.id,
  },
});

const notFound = (req, res) => {
  res.status(404).json(errorBody(req, 'ROUTE_NOT_FOUND', 'Route not found'));
};

const errorHandler = (err, req, res, _next) => {
  if (res.headersSent) return;

  if (err instanceof ZodError) {
    const fieldErrors = err.issues.reduce((all, issue) => {
      const field = issue.path.join('.') || 'request';
      all[field] = issue.message;
      return all;
    }, {});
    return res.status(400).json(errorBody(req, 'VALIDATION_FAILED', 'Check the highlighted fields', fieldErrors));
  }

  if (err?.name === 'CastError') {
    return res.status(400).json(errorBody(req, 'INVALID_ID', 'The supplied identifier is invalid'));
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'resource';
    return res.status(409).json(errorBody(req, 'DUPLICATE_VALUE', `${field} is already in use`, { [field]: 'Already in use' }));
  }

  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json(errorBody(req, 'FILE_TOO_LARGE', 'Each image must be 5 MB or smaller'));
  }

  const status = Number(err.status || err.statusCode) || 500;
  const code = err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED');
  const message = status >= 500 ? 'Something went wrong' : err.message;
  if (status >= 500) req.log?.error({ err }, 'request failed');
  return res.status(status).json(errorBody(req, code, message, err.fieldErrors));
};

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

module.exports = { ApiError, asyncHandler, errorBody, errorHandler, notFound };
