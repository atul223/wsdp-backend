const express = require('express');
const controller = require('./ehsNonConformitySummary.controller');
const {
  summaryItemCreateSchema,
  summaryItemPutSchema,
  summaryItemPatchSchema,
  validateBody,
} = require('./ehs.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByNonConformitySummaryItemId } = require('./ehs.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'ehs';

// GET /projects/:projectId/ehs-nonconformity-summary
// Backs the "Non-Conformities" table (Type / Count / Details / Status)
// that replaced the right half of the old combined table.
router.get(
  '/projects/:projectId/ehs-nonconformity-summary',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

router.post(
  '/projects/:projectId/ehs-nonconformity-summary',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(summaryItemCreateSchema),
  controller.create
);

router.get(
  '/ehs-nonconformity-summary/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByNonConformitySummaryItemId,
  controller.getOne
);

router.put(
  '/ehs-nonconformity-summary/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByNonConformitySummaryItemId,
  validateBody(summaryItemPutSchema),
  controller.fullUpdate
);

router.patch(
  '/ehs-nonconformity-summary/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByNonConformitySummaryItemId,
  validateBody(summaryItemPatchSchema),
  controller.partialUpdate
);

router.delete(
  '/ehs-nonconformity-summary/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByNonConformitySummaryItemId,
  controller.remove
);

module.exports = router;
