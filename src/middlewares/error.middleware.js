const AppError = require('../common/errors/AppError');
const logger = require('../common/utils/logger');

/* eslint-disable no-unused-vars */
function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    if (err.status >= 500) {
      logger.error(`${err.code}: ${err.message}`, { stack: err.stack });
    }
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Unexpected/unhandled error — log full detail, return a generic message.
  logger.error(err.message, { stack: err.stack });
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
}

function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `No route found for ${req.method} ${req.originalUrl}` },
  });
}

module.exports = { errorMiddleware, notFoundMiddleware };
