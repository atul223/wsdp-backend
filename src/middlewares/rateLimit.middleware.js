const rateLimit = require('express-rate-limit');

// Applied to /login, /password/forgot, /refresh — the endpoints most
// attractive to brute-force / credential-stuffing / token-guessing.
// Uses the default in-memory store; swap to a Redis store
// (rate-limit-redis) once running more than one API instance, so limits
// are shared across processes instead of per-instance.
function buildLimiter({ windowMinutes = 1, max = 10, message }) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: message || 'Too many requests. Please try again later.',
        },
      });
    },
  });
}

const loginLimiter = buildLimiter({
  windowMinutes: 1,
  max: 10,
  message: 'Too many login attempts. Please wait a minute and try again.',
});

const forgotPasswordLimiter = buildLimiter({
  windowMinutes: 15,
  max: 5,
  message: 'Too many password reset requests. Please try again later.',
});

const refreshLimiter = buildLimiter({
  windowMinutes: 1,
  max: 30,
  message: 'Too many refresh requests.',
});

module.exports = { loginLimiter, forgotPasswordLimiter, refreshLimiter };
