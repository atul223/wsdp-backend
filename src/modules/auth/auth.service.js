const bcrypt = require('bcrypt');
const prisma = require('../../config/db');
const env = require('../../config/env');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const {
  generateAccessToken,
  generateRefreshTokenValue,
  hashToken,
  refreshTokenExpiryDate,
  generateResetTokenValue,
  resetTokenExpiryDate,
} = require('./token.util');

/** Fetches the project IDs a user belongs to, for embedding in the JWT. */
async function getProjectIdsForUser(userId) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });
  return memberships.map((m) => m.projectId);
}

async function writeAuditLog({ userId, action, module, referenceId, ipAddress, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, module, referenceId, ipAddress, oldValue, newValue },
    });
  } catch (err) {
    // Audit logging must never break the main request flow.
    logger.error(`Failed to write audit log: ${err.message}`);
  }
}

// -----------------------------------------------------------------------
// Login
// -----------------------------------------------------------------------
async function login({ email, password, deviceInfo, ipAddress }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  // Generic error for both "no such user" and "wrong password" — never
  // reveal which one it was (prevents user enumeration).
  const invalidCredentialsError = () =>
    AppError.unauthorized('Invalid email or password');

  if (!user || user.deletedAt) throw invalidCredentialsError();

  if (user.status === 'locked' || (user.lockedUntil && user.lockedUntil > new Date())) {
    throw AppError.locked('Account is temporarily locked due to repeated failed login attempts. Try again later.');
  }

  if (user.status !== 'active') {
    throw invalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= env.security.maxFailedLoginAttempts;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + env.security.accountLockMinutes * 60 * 1000)
          : user.lockedUntil,
      },
    });

    throw invalidCredentialsError();
  }

  // Success — reset failed attempts, update last login.
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const projectIds = await getProjectIdsForUser(user.id);
  const accessToken = generateAccessToken(user, projectIds);

  const rawRefreshToken = generateRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawRefreshToken),
      deviceInfo,
      ipAddress,
      expiresAt: refreshTokenExpiryDate(),
    },
  });

  await writeAuditLog({ userId: user.id, action: 'login', module: 'auth', referenceId: user.id, ipAddress });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresInSeconds: env.jwt.accessExpiresInMinutes * 60,
    user: { id: user.id, name: user.name, email: user.email, role: user.role.name },
  };
}

// -----------------------------------------------------------------------
// Refresh (with rotation + reuse detection)
// -----------------------------------------------------------------------
async function refresh({ rawRefreshToken, deviceInfo, ipAddress }) {
  if (!rawRefreshToken) throw AppError.unauthorized('Missing refresh token');

  const tokenHash = hashToken(rawRefreshToken);
  const existing = await prisma.refreshToken.findFirst({ where: { tokenHash } });

  if (!existing) throw AppError.unauthorized('Invalid refresh token');

  if (existing.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token expired, please log in again');
  }

  if (existing.revoked || existing.replacedBy) {
    // Reuse of an already-rotated (or already-revoked) token: treat as
    // theft. Kill every active session for this user immediately.
    logger.error(`Refresh token reuse detected for user ${existing.userId}`);
    await prisma.refreshToken.updateMany({
      where: { userId: existing.userId, revoked: false },
      data: { revoked: true },
    });
    throw AppError.unauthorized('Session invalid — possible token reuse detected. Please log in again.');
  }

  const user = await prisma.user.findUnique({
    where: { id: existing.userId },
    include: { role: true },
  });

  if (!user || user.deletedAt || user.status !== 'active') {
    throw AppError.unauthorized('Account no longer active');
  }

  // Rotate: issue new refresh token, mark old one as replaced.
  const newRawRefreshToken = generateRefreshTokenValue();
  const newTokenRecord = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(newRawRefreshToken),
      deviceInfo,
      ipAddress,
      expiresAt: refreshTokenExpiryDate(),
    },
  });

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revoked: true, replacedBy: newTokenRecord.id },
  });

  const projectIds = await getProjectIdsForUser(user.id);
  const accessToken = generateAccessToken(user, projectIds);

  return {
    accessToken,
    refreshToken: newRawRefreshToken,
    expiresInSeconds: env.jwt.accessExpiresInMinutes * 60,
  };
}

// -----------------------------------------------------------------------
// Logout
// -----------------------------------------------------------------------
async function logout({ rawRefreshToken, userId, ipAddress }) {
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }
  if (userId) {
    await writeAuditLog({ userId, action: 'logout', module: 'auth', referenceId: userId, ipAddress });
  }
}

// -----------------------------------------------------------------------
// Password reset (forgot / reset)
// -----------------------------------------------------------------------
async function forgotPassword({ email }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always behave the same way whether or not the user exists —
  // prevents email enumeration via response timing/content.
  if (!user || user.deletedAt || user.status !== 'active') {
    return { rawToken: null, user: null };
  }

  const rawToken = generateResetTokenValue();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: resetTokenExpiryDate(),
    },
  });

  // In production this integrates with a real mailer (e.g., SES/SendGrid).
  // For now, the raw token/link is logged so the flow can be exercised
  // end-to-end in development without an SMTP setup.
  logger.info(`Password reset requested for ${email}. Reset token: ${rawToken}`);

  return { rawToken, user };
}

async function resetPassword({ token, newPassword }) {
  const tokenHash = hashToken(token);
  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
  });

  if (!resetRecord) {
    throw AppError.badRequest('Reset token is invalid or has expired');
  }

  const passwordHash = await bcrypt.hash(newPassword, env.bcrypt.saltRounds);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash, passwordChangedAt: new Date() },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
    // Password changed -> invalidate every active session for this user.
    prisma.refreshToken.updateMany({
      where: { userId: resetRecord.userId, revoked: false },
      data: { revoked: true },
    }),
  ]);

  await writeAuditLog({
    userId: resetRecord.userId,
    action: 'update',
    module: 'auth',
    referenceId: resetRecord.userId,
  });
}

async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw AppError.badRequest('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, env.bcrypt.saltRounds);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash, passwordChangedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    }),
  ]);

  await writeAuditLog({ userId, action: 'update', module: 'auth', referenceId: userId });
}

// -----------------------------------------------------------------------
// Session management
// -----------------------------------------------------------------------
async function listSessions(userId) {
  const sessions = await prisma.refreshToken.findMany({
    where: { userId, revoked: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, deviceInfo: true, ipAddress: true, createdAt: true, expiresAt: true },
  });
  return sessions;
}

async function revokeSession({ userId, sessionId }) {
  const session = await prisma.refreshToken.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) {
    throw AppError.notFound('Session not found');
  }
  await prisma.refreshToken.update({ where: { id: sessionId }, data: { revoked: true } });
}

async function revokeAllSessions(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

async function adminRevokeUserSessions(targetUserId) {
  await prisma.refreshToken.updateMany({
    where: { userId: targetUserId, revoked: false },
    data: { revoked: true },
  });
}

// -----------------------------------------------------------------------
// Current user
// -----------------------------------------------------------------------
async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
  });
  if (!user || user.deletedAt) throw AppError.notFound('User not found');

  const permissions = user.role.rolePermissions.map(
    (rp) => `${rp.permission.module}:${rp.permission.action}`
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
    permissions,
  };
}

module.exports = {
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  listSessions,
  revokeSession,
  revokeAllSessions,
  adminRevokeUserSessions,
  getMe,
};
