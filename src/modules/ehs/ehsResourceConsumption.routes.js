const express = require('express');
const controller = require('./ehsResourceConsumption.controller');
const {
  resourceConsumptionCreateSchema,
  resourceConsumptionPutSchema,
  resourceConsumptionPatchSchema,
  validateBody,
} = require('./ehs.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByResourceConsumptionId } = require('./ehs.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'ehs';

// GET /projects/:projectId/ehs-resource-consumption
router.get(
  '/projects/:projectId/ehs-resource-consumption',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

router.post(
  '/projects/:projectId/ehs-resource-consumption',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(resourceConsumptionCreateSchema),
  controller.create
);

router.get(
  '/ehs-resource-consumption/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByResourceConsumptionId,
  controller.getOne
);

router.put(
  '/ehs-resource-consumption/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByResourceConsumptionId,
  validateBody(resourceConsumptionPutSchema),
  controller.fullUpdate
);

router.patch(
  '/ehs-resource-consumption/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByResourceConsumptionId,
  validateBody(resourceConsumptionPatchSchema),
  controller.partialUpdate
);

router.delete(
  '/ehs-resource-consumption/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByResourceConsumptionId,
  controller.remove
);

module.exports = router;
