
const AppError = require('../../common/errors/AppError');
const { requireProjectScope } = require('../../middlewares/role.middleware');
const reportService = require('./report.service');

const scopeByReportId = [
  async (req, res, next) => {
    try {
      const projectId = await reportService.getProjectIdForReport(req.params.id);

      if (!projectId) {
        return next(AppError.notFound('Report not found'));
      }

      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

const scopeByPeriodicReportId = [
  async (req, res, next) => {
    try {
      const projectId = await reportService.getProjectIdForPeriodicReport(req.params.id);

      if (!projectId) {
        return next(AppError.notFound('Periodic report not found'));
      }

      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

const scopeByMethodStatementId = [
  async (req, res, next) => {
    try {
      const projectId = await reportService.getProjectIdForMethodStatement(req.params.id);

      if (!projectId) {
        return next(AppError.notFound('Method statement not found'));
      }

      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

module.exports = {
  scopeByReportId,
  scopeByPeriodicReportId,
  scopeByMethodStatementId,
};
