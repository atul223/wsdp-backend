const express = require('express');
const controller = require('./risk.controller');
const { riskCreateSchema, riskPutSchema, riskPatchSchema, validateBody } = require('./riskDelay.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByRiskId } = require('./riskDelay.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'risk_delay';

// GET /projects/:projectId/risks
router.get(
  '/projects/:projectId/risks',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

// POST /projects/:projectId/risks
router.post(
  '/projects/:projectId/risks',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(riskCreateSchema),
  controller.create
);

// GET /risks/:id
router.get(
  '/risks/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByRiskId,
  controller.getOne
);

// PUT /risks/:id
router.put(
  '/risks/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByRiskId,
  validateBody(riskPutSchema),
  controller.fullUpdate
);

// PATCH /risks/:id
router.patch(
  '/risks/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByRiskId,
  validateBody(riskPatchSchema),
  controller.partialUpdate
);

// DELETE /risks/:id — Admin only, and only while status='open'
// (enforced in the service); mitigated/closed risks are part of the
// permanent risk register history.
router.delete(
  '/risks/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByRiskId,
  controller.remove
);

module.exports = router;
