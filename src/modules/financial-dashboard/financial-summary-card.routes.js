const express = require('express');
const controller = require('./financial-summary-card.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'financial_dashboard';

/**
 * Full CRUD for the 8 Financial Dashboard summary/reference KPI cards:
 *   financial_progress_pct, physical_progress_pct, cumulative_expenditure,
 *   ipc_status, total_contract, advance_payment_20, contract_balance,
 *   prov_sum_15
 *
 * IMPORTANT — 404 troubleshooting:
 * If you get "No route found for PUT /api/v1/projects/:id/
 * financial-summary-cards/:cardKey", this file exists but is NOT being
 * mounted by your server. Check (in this order):
 *   1. This file is saved at modules/financial/financial-summary-card.routes.js
 *      (exact path/name) and committed + pushed to the repo Render deploys from.
 *   2. modules/financial/index.js requires AND uses this router
 *      (see financial-index.js provided alongside this file).
 *   3. Your main app.js/server.js actually requires modules/financial/index.js
 *      (or, if your app registers each financial route file directly instead
 *      of via that aggregator, you must ALSO add a direct
 *      `app.use('/api/v1', require('./modules/financial/financial-summary-card.routes'))`
 *      line there — this is the same fix you had to apply for
 *      payment-tracking.routes.js previously).
 *   4. Render has actually redeployed the latest commit (check the Render
 *      dashboard's deploy logs / trigger a manual deploy if unsure).
 */

router.put(
  '/projects/:projectId/financial-summary-cards/:cardKey',
  authenticate,
  requirePermission(MODULE, 'update'),
  requireProjectScope((req) => req.params.projectId),
  controller.updateCard
);

router.delete(
  '/projects/:projectId/financial-summary-cards/:cardKey',
  authenticate,
  requirePermission(MODULE, 'delete'),
  requireProjectScope((req) => req.params.projectId),
  controller.resetCard
);

module.exports = router;
