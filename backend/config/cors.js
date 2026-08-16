const DEFAULT_DEVELOPMENT_ORIGINS = ['http://localhost:5173'];

const getAllowedOrigins = () => {
  const configured = [process.env.CLIENT_URL, ...(process.env.ALLOWED_ORIGINS || '').split(',')]
    .map((origin) => origin?.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === 'production') return [...new Set(configured)];
  return [...new Set([...DEFAULT_DEVELOPMENT_ORIGINS, ...configured])];
};

const buildCorsOptions = () => {
  const allowedOrigins = getAllowedOrigins();

  if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    throw new Error('CLIENT_URL or ALLOWED_ORIGINS must be configured in production');
  }

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      const error = new Error('Origin is not allowed');
      error.status = 403;
      error.code = 'CORS_ORIGIN_DENIED';
      return callback(error);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-ID', 'X-KOBO-Refresh'],
  };
};

module.exports = { buildCorsOptions, getAllowedOrigins };
