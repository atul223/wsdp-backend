const express = require('express');
const controller = require('./riskDelaySummary.controller');
const { summaryPutSchema, validateBody } = require('./extraValidation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'risk_delay';

// GET /projects/:projectId/risk-delay-summary
router.get(
  '/projects/:projectId/risk-delay-summary',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.getOne
);

// PUT /projects/:projectId/risk-delay-summary — upsert.
// All 4 fields are nullable; null means "auto-calculate this card
// from Delay records" rather than showing a fixed value.
router.put(
  '/projects/:projectId/risk-delay-summary',
  authenticate,
  requirePermission(MODULE, 'update'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(summaryPutSchema),
  controller.upsert
);

module.exports = router;
