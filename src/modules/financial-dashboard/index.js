/**
 * modules/financial/index.js
 *
 * Aggregator router for the entire financial_dashboard module.
 * UPDATED: registers the new financial-summary-card.routes.js so the
 * PUT/DELETE endpoints for the 8 KPI summary cards are live.
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
