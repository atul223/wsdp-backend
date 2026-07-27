const AppError = require('../../common/errors/AppError');
const { requireProjectScope } = require('../../middlewares/role.middleware');
const riskService = require('./risk.service');
const delayService = require('./delay.service');

const scopeByRiskId = [
  async (req, res, next) => {
    try {
      const projectId = await riskService.getProjectIdForRisk(req.params.id);
      if (!projectId) return next(AppError.notFound('Risk not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

const scopeByDelayId = [
  async (req, res, next) => {
    try {
      const projectId = await delayService.getProjectIdForDelay(req.params.id);
      if (!projectId) return next(AppError.notFound('Delay record not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

module.exports = { scopeByRiskId, scopeByDelayId };
