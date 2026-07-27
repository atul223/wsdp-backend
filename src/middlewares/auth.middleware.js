const { verifyAccessToken } = require('../modules/auth/token.util');
const AppError = require('../common/errors/AppError');

/**
 * Verifies the Bearer access token and attaches req.user = { id, role, projectIds }.
 * Stateless — no DB lookup here by design (see auth-system-design.md §8).
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(AppError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      projectIds: payload.project_ids || [],
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired', { status: 401, code: 'TOKEN_EXPIRED' }));
    }
    return next(AppError.unauthorized('Invalid access token'));
  }
}

module.exports = { authenticate };
