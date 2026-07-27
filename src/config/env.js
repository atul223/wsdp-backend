require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  database: {
    url: required('DATABASE_URL'),
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    accessExpiresInMinutes: parseInt(process.env.JWT_ACCESS_EXPIRES_MIN || '15', 10),
    refreshExpiresInDays: parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10),
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },

  security: {
    maxFailedLoginAttempts: parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS || '5', 10),
    accountLockMinutes: parseInt(process.env.ACCOUNT_LOCK_MINUTES || '15', 10),
    passwordResetTokenExpiryMinutes: parseInt(
      process.env.PASSWORD_RESET_TOKEN_EXPIRY_MIN || '30',
      10
    ),
  },

  cookies: {
    refreshTokenCookieName: 'refresh_token',
  },
};
