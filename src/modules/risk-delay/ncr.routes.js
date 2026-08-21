const express = require('express');
const controller = require('./ncr.controller');
const { ncrCreateSchema, ncrPatchSchema, validateBody } = require('./extraValidation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByNcrId } = require('./extraScope.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'risk_delay';

// GET /projects/:projectId/non-conformities
router.get(
  '/projects/:projectId/non-conformities',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

// POST /projects/:projectId/non-conformities
router.post(
  '/projects/:projectId/non-conformities',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(ncrCreateSchema),
  controller.create
);

// GET /non-conformities/:id
router.get(
  '/non-conformities/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByNcrId,
  controller.getOne
);

// PATCH /non-conformities/:id
router.patch(
  '/non-conformities/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByNcrId,
  validateBody(ncrPatchSchema),
  controller.update
);

// DELETE /non-conformities/:id — Admin/Project Manager only.
router.delete(
  '/non-conformities/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByNcrId,
  controller.remove
);

module.exports = router;
