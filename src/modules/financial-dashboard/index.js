/**
 * modules/financial/index.js
 *
 * Aggregator router for the entire financial_dashboard module.
 * Registers financial-summary-card.routes.js so the PUT/DELETE
 * endpoints for the 8 KPI summary cards are live.
 *
 * IF YOUR APP DOES NOT USE THIS AGGREGATOR PATTERN:
 * Some backends register each module's route file directly in
 * app.js/server.js instead of going through a per-module index.js like
 * this one (you hit exactly this with payment-tracking.routes.js
 * previously — it had to be registered "on the main router" directly).
 * If that's how your app is structured, ALSO add this line wherever
 * your other financial routes (budget, invoice, ipc-tracker, amendment,
 * bank-guarantee, payment-tracking) are registered:
 *
 *   app.use('/api/v1', require('./modules/financial/financial-summary-card.routes'));
 *
 * Share your app.js/server.js (or main routes file) with me if you're
 * unsure which pattern applies — I can then produce the exact one-line
 * patch for the correct location instead of this generic guidance.
 */

const express = require('express');

const budgetRoutes = require('./budget.routes');
const invoiceRoutes = require('./invoice.routes');
const financialSummaryRoutes = require('./financial-summary.routes');
const financialSummaryCardRoutes = require('./financial-summary-card.routes'); // <-- NEWLY REGISTERED
const ipcTrackerRoutes = require('./ipc-tracker.routes');
const amendmentRoutes = require('./amendment.routes');
const bankGuaranteeRoutes = require('./bank-guarantee.routes');
const paymentTrackingRoutes = require('./payment-tracking.routes');

const router = express.Router();

router.use(budgetRoutes);
router.use(invoiceRoutes);
router.use(financialSummaryRoutes);
router.use(financialSummaryCardRoutes); // <-- NEWLY REGISTERED
router.use(ipcTrackerRoutes);
router.use(amendmentRoutes);
router.use(bankGuaranteeRoutes);
router.use(paymentTrackingRoutes);

module.exports = router;
