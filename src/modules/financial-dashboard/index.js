/**
 * modules/financial/index.js
 *
 * Aggregator router for the entire financial_dashboard module.
 *
 * ASSUMPTION / PLEASE VERIFY:
 * This file was reconstructed (not copied from your codebase) based
 * on the consistent pattern across all six route files you shared
 * (amendment.routes.js, bank-guarantee.routes.js, budget.routes.js,
 * invoice.routes.js, ipc-tracker.routes.js, financial-summary.routes.js):
 *   - they all live in the same modules/financial/ folder
 *     (per your backend-architecture.md folder structure)
 *   - none of their internal paths are prefixed with "/financial"
 *     (e.g. '/projects/:projectId/budgets', not
 *     '/financial/projects/:projectId/budgets')
 * ...which strongly implies they are combined into ONE router here
 * and that combined router is mounted directly at your API root in
 * app.js/server.js (e.g. app.use('/api/v1', financialModuleRoutes)).
 *
 * If your actual file differs (different filename, different mount
 * prefix, or routes registered individually in app.js instead of
 * aggregated here), just share that file and I will adjust this to
 * match exactly instead of guessing.
 */

const express = require('express');

const budgetRoutes = require('./budget.routes');
const invoiceRoutes = require('./invoice.routes');
const financialSummaryRoutes = require('./financial-summary.routes');
const ipcTrackerRoutes = require('./ipc-tracker.routes');
const amendmentRoutes = require('./amendment.routes');
const bankGuaranteeRoutes = require('./bank-guarantee.routes');
const paymentTrackingRoutes = require('./payment-tracking.routes'); // <-- NEWLY REGISTERED

const router = express.Router();

router.use(budgetRoutes);
router.use(invoiceRoutes);
router.use(financialSummaryRoutes);
router.use(ipcTrackerRoutes);
router.use(amendmentRoutes);
router.use(bankGuaranteeRoutes);
router.use(paymentTrackingRoutes); // <-- NEWLY REGISTERED

module.exports = router;

/**
 * In app.js / server.js, this aggregator is expected to be mounted
 * something like:
 *
 *   const financialModuleRoutes = require('./modules/financial');
 *   app.use('/api/v1', financialModuleRoutes);
 *
 * No change is needed there once this index.js requires
 * payment-tracking.routes.js as shown above -- the new
 * /projects/:projectId/payment-tracking and /payment-tracking/:id
 * endpoints will automatically be live under your existing
 * /api/v1 prefix, exactly like amendments and bank-guarantees are today.
 */
