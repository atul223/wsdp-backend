const express = require('express');
const controller = require('./correctiveAction.controller');
const { correctiveActionCreateSchema, correctiveActionPatchSchema, validateBody } = require('./extraValidation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByCorrectiveActionId } = require('./extraScope.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'risk_delay';

// GET /projects/:projectId/corrective-actions
router.get(
  '/projects/:projectId/corrective-actions',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

// POST /projects/:projectId/corrective-actions
router.post(
  '/projects/:projectId/corrective-actions',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(correctiveActionCreateSchema),
  controller.create
);

// GET /corrective-actions/:id
router.get(
  '/corrective-actions/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByCorrectiveActionId,
  controller.getOne
);

// PATCH /corrective-actions/:id
router.patch(
  '/corrective-actions/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByCorrectiveActionId,
  validateBody(correctiveActionPatchSchema),
  controller.update
);

// DELETE /corrective-actions/:id — Admin/Project Manager only.
router.delete(
  '/corrective-actions/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByCorrectiveActionId,
  controller.remove
);

module.exports = router;
