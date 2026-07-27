const express = require('express');
const controller = require('./delay.controller');
const { delayCreateSchema, delayPutSchema, delayPatchSchema, validateBody } = require('./riskDelay.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByDelayId } = require('./riskDelay.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'risk_delay';

// GET /projects/:projectId/delays
router.get(
  '/projects/:projectId/delays',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

// POST /projects/:projectId/delays
router.post(
  '/projects/:projectId/delays',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(delayCreateSchema),
  controller.create
);

// GET /delays/:id
router.get(
  '/delays/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByDelayId,
  controller.getOne
);

// PUT /delays/:id
router.put(
  '/delays/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByDelayId,
  validateBody(delayPutSchema),
  controller.fullUpdate
);

// PATCH /delays/:id
router.patch(
  '/delays/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByDelayId,
  validateBody(delayPatchSchema),
  controller.partialUpdate
);

// DELETE /delays/:id — Admin/Project Manager only. Delay records are not
// subject to a "permanent record" block like incidents/risks.
router.delete(
  '/delays/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByDelayId,
  controller.remove
);

module.exports = router;
