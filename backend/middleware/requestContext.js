const { randomUUID } = require('crypto');
const pinoHttp = require('pino-http');

const requestLogger = pinoHttp({
  genReqId(req, res) {
    const id = req.headers['x-request-id'] || randomUUID();
    res.setHeader('X-Request-ID', id);
    return id;
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'req.body.otp',
      'req.body.phone',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
  autoLogging: process.env.NODE_ENV === 'test' ? false : {
    ignore: (req) => req.url === '/api/health',
  },
});

module.exports = requestLogger;
