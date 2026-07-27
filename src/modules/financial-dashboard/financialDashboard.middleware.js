const AppError = require('../../common/errors/AppError');
const { requireProjectScope } = require('../../middlewares/role.middleware');
const budgetService = require('./budget.service');
const invoiceService = require('./invoice.service');

/**
 * For endpoints keyed by /budgets/:id — resolves the parent project id
 * from the budget, then applies the standard project-scope check.
 */
const scopeByBudgetId = [
  async (req, res, next) => {
    try {
      const projectId = await budgetService.getProjectIdForBudget(req.params.id);
      if (!projectId) return next(AppError.notFound('Budget not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

/**
 * For endpoints keyed by /budgets/:budgetId/invoices — scope check is
 * against the budget's project, confirming the budget exists as part
 * of resolving scope.
 */
const scopeByBudgetParam = [
  async (req, res, next) => {
    try {
      const projectId = await budgetService.getProjectIdForBudget(req.params.budgetId);
      if (!projectId) return next(AppError.notFound('Budget not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

/**
 * For endpoints keyed by /invoices/:id — resolves the parent project id
 * by walking invoice -> budget -> project.
 */
const scopeByInvoiceId = [
  async (req, res, next) => {
    try {
      const projectId = await invoiceService.getProjectIdForInvoice(req.params.id);
      if (!projectId) return next(AppError.notFound('Invoice not found'));
      req.resolvedProjectId = projectId;
      next();
    } catch (err) {
      next(err);
    }
  },
  requireProjectScope((req) => req.resolvedProjectId),
];

module.exports = { scopeByBudgetId, scopeByBudgetParam, scopeByInvoiceId };
