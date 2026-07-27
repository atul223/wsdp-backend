const AppError = require('../../common/errors/AppError');
const { requireProjectScope } = require('../../middlewares/role.middleware');
const incidentService = require('./ehsIncident.service');
const inspectionService = require('./ehsInspection.service');

const scopeByIncidentId = [
  async (req, res, next) => {
    try {
      const projectId = await incidentService.getProjectIdForIncident(req.params.id);
      if (!projectId) return next(AppError.notFound('EHS incident not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

const scopeByInspectionId = [
  async (req, res, next) => {
    try {
      const projectId = await inspectionService.getProjectIdForInspection(req.params.id);
      if (!projectId) return next(AppError.notFound('EHS inspection not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

const scopeByChecklistItemId = [
  async (req, res, next) => {
    try {
      const projectId = await inspectionService.getProjectIdForChecklistItem(req.params.itemId);
      if (!projectId) return next(AppError.notFound('Checklist item not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

module.exports = { scopeByIncidentId, scopeByInspectionId, scopeByChecklistItemId };
