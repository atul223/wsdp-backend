const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../../config/env');

/**
 * Access token: signed JWT, short-lived, carries role + project scope
 * so most requests can be authorized without a DB round-trip.
 */
function generateAccessToken(user, projectIds = []) {
  const payload = {
    sub: user.id,
    role: user.role.name,
    project_ids: projectIds,
    type: 'access',
  };
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: `${env.jwt.accessExpiresInMinutes}m`,
  });
}

function verifyAccessToken(token) {
  // Throws if invalid/expired — caller (auth middleware) handles the error.
  return jwt.verify(token, env.jwt.accessSecret);
}

/**
 * Refresh token: opaque random string, NOT a JWT. Only the SHA-256 hash
 * is ever persisted; the raw value goes out once, in an httpOnly cookie.
 */
function generateRefreshTokenValue() {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(rawValue) {
  return crypto.createHash('sha256').update(rawValue).digest('hex');
}

function refreshTokenExpiryDate() {
  const days = env.jwt.refreshExpiresInDays;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/** Generic random token generator for password reset tokens. */
function generateResetTokenValue() {
  return crypto.randomBytes(32).toString('hex');
}

function resetTokenExpiryDate() {
  const minutes = env.security.passwordResetTokenExpiryMinutes;
  return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshTokenValue,
  hashToken,
  refreshTokenExpiryDate,
  generateResetTokenValue,
  resetTokenExpiryDate,
};
