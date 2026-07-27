const AppError = require('../../common/errors/AppError');
const { requireProjectScope } = require('../../middlewares/role.middleware');
const workPackageService = require('./workPackage.service');
const progressEntryService = require('./progressEntry.service');

/**
 * For endpoints keyed by /work-packages/:id — resolves the parent
 * project id from the work package, then applies the standard
 * project-scope check (Admin/Read Only bypass, others must be a
 * member of that project).
 */
const scopeByWorkPackageId = [
  async (req, res, next) => {
    try {
      const projectId = await workPackageService.getProjectIdForWorkPackage(req.params.id);
      if (!projectId) return next(AppError.notFound('Work package not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

/**
 * For endpoints keyed by /work-packages/:workPackageId/progress-entries —
 * scope check is against the work package's project, using the path
 * param directly (no extra lookup needed for the ID itself, but we still
 * confirm the work package exists as part of resolving scope).
 */
const scopeByWorkPackageParam = [
  async (req, res, next) => {
    try {
      const projectId = await workPackageService.getProjectIdForWorkPackage(req.params.workPackageId);
      if (!projectId) return next(AppError.notFound('Work package not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

/**
 * For endpoints keyed by /progress-entries/:id — resolves the parent
 * project id by walking entry -> work package -> project.
 */
const scopeByProgressEntryId = [
  async (req, res, next) => {
    try {
      const projectId = await progressEntryService.getProjectIdForEntry(req.params.id);
      if (!projectId) return next(AppError.notFound('Progress entry not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

module.exports = { scopeByWorkPackageId, scopeByWorkPackageParam, scopeByProgressEntryId };
