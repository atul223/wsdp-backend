/**
 * Custom application error — thrown from services/controllers whenever a
 * request should fail with a specific HTTP status + machine-readable code.
 * Caught centrally by the error middleware.
 */
class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details = undefined } = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new AppError(message, { status: 400, code: 'VALIDATION_ERROR', details });
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, { status: 401, code: 'UNAUTHORIZED' });
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, { status: 403, code: 'FORBIDDEN' });
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, { status: 404, code: 'NOT_FOUND' });
  }

  static conflict(message, code = 'CONFLICT') {
    return new AppError(message, { status: 409, code });
  }

  static locked(message = 'Account temporarily locked') {
    return new AppError(message, { status: 423, code: 'ACCOUNT_LOCKED' });
  }

  static unprocessable(message, details) {
    return new AppError(message, { status: 422, code: 'UNPROCESSABLE_ENTITY', details });
  }
}

module.exports = AppError;
