const express = require('express');
const controller = require('./ehsIncidentSummary.controller');
const {
  summaryItemCreateSchema,
  summaryItemPutSchema,
  summaryItemPatchSchema,
  validateBody,
} = require('./ehs.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByIncidentSummaryItemId } = require('./ehs.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'ehs';

// GET /projects/:projectId/ehs-incident-summary
// Backs the "Incidents" table (Type / Count / Details / Status) that
// replaced the left half of the old "Incidents & Non-Conformities" table.
router.get(
  '/projects/:projectId/ehs-incident-summary',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

router.post(
  '/projects/:projectId/ehs-incident-summary',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(summaryItemCreateSchema),
  controller.create
);

router.get(
  '/ehs-incident-summary/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByIncidentSummaryItemId,
  controller.getOne
);

router.put(
  '/ehs-incident-summary/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByIncidentSummaryItemId,
  validateBody(summaryItemPutSchema),
  controller.fullUpdate
);

router.patch(
  '/ehs-incident-summary/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByIncidentSummaryItemId,
  validateBody(summaryItemPatchSchema),
  controller.partialUpdate
);

router.delete(
  '/ehs-incident-summary/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByIncidentSummaryItemId,
  controller.remove
);

module.exports = router;
