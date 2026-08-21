const AppError = require('../../common/errors/AppError');
const { requireProjectScope } = require('../../middlewares/role.middleware');
const incidentService = require('./ehsIncident.service');
const inspectionService = require('./ehsInspection.service');
const AppError = require('../../common/errors/AppError');
const { requireProjectScope } = require('../../middlewares/role.middleware');
const incidentSummaryService = require('./ehsIncidentSummary.service');
const nonConformitySummaryService = require('./ehsNonConformitySummary.service');
const resourceConsumptionService = require('./ehsResourceConsumption.service');
const complianceSummaryService = require('./ehsCompliance.service');


function buildScopeById(getProjectId, notFoundMessage) {
  return [
    async (req, res, next) => {
      try {
        const id = req.params.id || req.params.itemId;
        const projectId = await getProjectId(id);
        if (!projectId) throw AppError.notFound(notFoundMessage);
        req._resolvedProjectId = projectId;
        next();
      } catch (err) {
        next(err);
      }
    },
    requireProjectScope((req) => req._resolvedProjectId),
  ];
}

const scopeByIncidentSummaryItemId = buildScopeById(
  (id) => incidentSummaryService.getProjectIdForItem(id),
  'EHS incident summary item not found'
);

const scopeByNonConformitySummaryItemId = buildScopeById(
  (id) => nonConformitySummaryService.getProjectIdForItem(id),
  'EHS non-conformity summary item not found'
);

const scopeByResourceConsumptionId = buildScopeById(
  (id) => resourceConsumptionService.getProjectIdForItem(id),
  'EHS resource consumption row not found'
);


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

module.exports = { scopeByIncidentId, scopeByInspectionId, scopeByChecklistItemId, scopeByIncidentSummaryItemId,scopeByNonConformitySummaryItemId,scopeByResourceConsumptionId, };
