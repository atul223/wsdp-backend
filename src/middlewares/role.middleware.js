const prisma = require('../config/db');
const AppError = require('../common/errors/AppError');
const { GLOBAL_SCOPE_ROLES } = require('../common/constants/roles');

/**
 * requireRole — coarse check: does req.user.role match one of the allowed
 * role names? Use for endpoints that are simply "Admin only", etc.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(`This action requires one of the following roles: ${allowedRoles.join(', ')}`));
    }
    next();
  };
}

/**
 * requirePermission — fine-grained check against role_permissions
 * (module, action). Looked up from the DB rather than trusting a stale
 * JWT claim, since permission grants can change without forcing re-login.
 * A short in-memory cache keeps this from hitting the DB on every request.
 */
const permissionCache = new Map(); // roleName -> Set("module:action")
const CACHE_TTL_MS = 60 * 1000;
let cacheLoadedAt = 0;

async function loadPermissionCache() {
  const roles = await prisma.role.findMany({
    include: { rolePermissions: { include: { permission: true } } },
  });
  permissionCache.clear();
  for (const role of roles) {
    const set = new Set(
      role.rolePermissions.map((rp) => `${rp.permission.module}:${rp.permission.action}`)
    );
    permissionCache.set(role.name, set);
  }
  cacheLoadedAt = Date.now();
}

function requirePermission(module, action) {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(AppError.unauthorized());

      if (Date.now() - cacheLoadedAt > CACHE_TTL_MS) {
        await loadPermissionCache();
      }

      const allowed = permissionCache.get(req.user.role);
      if (!allowed || !allowed.has(`${module}:${action}`)) {
        return next(AppError.forbidden(`Role '${req.user.role}' cannot ${action} '${module}'`));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * requireProjectScope — for endpoints scoped to :projectId (or a resolved
 * project id passed via req.resolvedProjectId), confirms the user's role
 * either has global scope (Admin/Read Only User) or the project is in
 * their assigned project_ids.
 */
function requireProjectScope(getProjectId) {
  return (req, res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (GLOBAL_SCOPE_ROLES.includes(req.user.role)) return next();

    const projectId = getProjectId(req);
    if (!projectId) return next(AppError.badRequest('Project id could not be resolved'));

    if (!req.user.projectIds.includes(projectId)) {
      return next(AppError.forbidden('You do not have access to this project'));
    }
    next();
  };
}

module.exports = { requireRole, requirePermission, requireProjectScope, loadPermissionCache };
