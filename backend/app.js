const express = require('express');
const cors = require('cors');
const { buildCorsOptions } = require('./config/cors');
const requestLogger = require('./middleware/requestContext');
const { apiLimiter, sanitizeRequest, securityHeaders } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errors');

const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(requestLogger);
  app.use(securityHeaders);
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '250kb', verify: (req, _res, buffer) => { req.rawBody = buffer; } }));
  app.use(express.urlencoded({ extended: false, limit: '250kb' }));
  app.use('/api/v1/payments/webhooks', require('./routes/paymentWebhooks'));
  app.use(sanitizeRequest);
  app.use('/api', apiLimiter);

  app.get('/api/health', (req, res) => res.json({ status: 'ok', requestId: req.id }));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/listings', require('./routes/listings'));
  app.use('/api/services', require('./routes/services'));
  app.use('/api/messages', require('./routes/messages'));
  app.use('/api/favorites', require('./routes/favorites'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/v1/verifications', require('./routes/verifications'));
  app.use('/api/v1/conversations', require('./routes/conversations'));
  app.use('/api/v1/orders', require('./routes/orders'));
  app.use('/api/v1/reviews', require('./routes/reviews'));
  app.use('/api/v1/disputes', require('./routes/disputes'));
  app.use('/api/v1/wallet', require('./routes/wallet'));
  app.use('/api/v1/admin/audit', require('./routes/audit'));

  app.use(notFound);
  app.use(errorHandler);
  return app;
};

module.exports = createApp;
