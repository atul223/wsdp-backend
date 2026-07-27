const authService = require('./auth.service');
const { success, noContent } = require('../../common/responses/apiResponse');
const env = require('../../config/env');
const AppError = require('../../common/errors/AppError');

const REFRESH_COOKIE = env.cookies.refreshTokenCookieName;

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: env.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth', // scoped to auth endpoints only
  };
}

function getDeviceInfo(req) {
  return req.headers['user-agent'] || 'unknown';
}

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || null;
}

// -----------------------------------------------------------------------
async function login(req, res, next) {
  try {
    const { email, password } = req.validatedBody;
    const result = await authService.login({
      email,
      password,
      deviceInfo: getDeviceInfo(req),
      ipAddress: getClientIp(req),
    });

    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());

    return success(res, {
      data: {
        access_token: result.accessToken,
        expires_in: result.expiresInSeconds,
        user: result.user,
      },
      message: 'Login successful',
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE];
    const result = await authService.refresh({
      rawRefreshToken,
      deviceInfo: getDeviceInfo(req),
      ipAddress: getClientIp(req),
    });

    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());

    return success(res, {
      data: { access_token: result.accessToken, expires_in: result.expiresInSeconds },
      message: 'Token refreshed',
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE];
    await authService.logout({
      rawRefreshToken,
      userId: req.user?.id,
      ipAddress: getClientIp(req),
    });

    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    return success(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.validatedBody;
    await authService.forgotPassword({ email });
    // Always the same generic response, regardless of whether the email exists.
    return success(res, {
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, new_password: newPassword } = req.validatedBody;
    await authService.resetPassword({ token, newPassword });
    return success(res, { message: 'Password has been reset. Please log in with your new password.' });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password: currentPassword, new_password: newPassword } = req.validatedBody;
    await authService.changePassword({ userId: req.user.id, currentPassword, newPassword });
    return success(res, { message: 'Password changed successfully. Please log in again on other devices.' });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const profile = await authService.getMe(req.user.id);
    return success(res, { data: profile });
  } catch (err) {
    next(err);
  }
}

async function listSessions(req, res, next) {
  try {
    const sessions = await authService.listSessions(req.user.id);
    return success(res, { data: sessions });
  } catch (err) {
    next(err);
  }
}

async function revokeSession(req, res, next) {
  try {
    await authService.revokeSession({ userId: req.user.id, sessionId: req.params.id });
    return noContent(res);
  } catch (err) {
    next(err);
  }
}

async function revokeAllSessions(req, res, next) {
  try {
    await authService.revokeAllSessions(req.user.id);
    return success(res, { message: 'All sessions revoked. Please log in again.' });
  } catch (err) {
    next(err);
  }
}

async function adminRevokeUserSessions(req, res, next) {
  try {
    if (!req.params.id) throw AppError.badRequest('User id is required');
    await authService.adminRevokeUserSessions(req.params.id);
    return success(res, { message: 'All sessions for the specified user have been revoked.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  listSessions,
  revokeSession,
  revokeAllSessions,
  adminRevokeUserSessions,
};
