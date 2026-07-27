const AppError = require('../../common/errors/AppError');
const { requireProjectScope } = require('../../middlewares/role.middleware');
const resourceService = require('./resource.service');
const allocationService = require('./allocation.service');

/**
 * For endpoints keyed by /resources/:id — resolves the parent project id
 * from the resource, then applies the standard project-scope check.
 */
const scopeByResourceId = [
  async (req, res, next) => {
    try {
      const projectId = await resourceService.getProjectIdForResource(req.params.id);
      if (!projectId) return next(AppError.notFound('Resource not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

/**
 * For endpoints keyed by /resources/:resourceId/allocations — scope check
 * is against the resource's project, confirming the resource exists as
 * part of resolving scope.
 */
const scopeByResourceParam = [
  async (req, res, next) => {
    try {
      const projectId = await resourceService.getProjectIdForResource(req.params.resourceId);
      if (!projectId) return next(AppError.notFound('Resource not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

/**
 * For endpoints keyed by /allocations/:id — resolves the parent project
 * id by walking allocation -> resource -> project.
 */
const scopeByAllocationId = [
  async (req, res, next) => {
    try {
      const projectId = await allocationService.getProjectIdForAllocation(req.params.id);
      if (!projectId) return next(AppError.notFound('Allocation not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

module.exports = { scopeByResourceId, scopeByResourceParam, scopeByAllocationId };
