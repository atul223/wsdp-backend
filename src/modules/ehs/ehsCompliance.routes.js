const express = require('express');
const controller = require('./ehsCompliance.controller');
const { complianceSummaryPatchSchema, validateBody } = require('./ehs.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'ehs';

// GET /projects/:projectId/ehs-compliance-summary
// Returns the 7 KPI cards: 5 plan/compliance percentages (manually set)
// plus Open Incidents & Toolbox Talks (30D), which auto-calculate unless
// an override has been saved for them.
router.get(
  '/projects/:projectId/ehs-compliance-summary',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.getOne
);

// PATCH /projects/:projectId/ehs-compliance-summary
// Upserts any subset of the card values. Set an override field to null
// to revert that card back to auto-calculating.
router.patch(
  '/projects/:projectId/ehs-compliance-summary',
  authenticate,
  requirePermission(MODULE, 'update'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(complianceSummaryPatchSchema),
  controller.patch
);

module.exports = router;
