const express = require('express');
const controller = require('./ehsIncident.controller');
const {
  incidentCreateSchema,
  incidentPutSchema,
  incidentPatchSchema,
  validateBody,
} = require('./ehs.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByIncidentId } = require('./ehs.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'ehs';

// GET /projects/:projectId/ehs-incidents
router.get(
  '/projects/:projectId/ehs-incidents',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

// POST /projects/:projectId/ehs-incidents
router.post(
  '/projects/:projectId/ehs-incidents',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(incidentCreateSchema),
  controller.create
);

// GET /ehs-incidents/:id
router.get(
  '/ehs-incidents/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByIncidentId,
  controller.getOne
);

// PUT /ehs-incidents/:id
router.put(
  '/ehs-incidents/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByIncidentId,
  validateBody(incidentPutSchema),
  controller.fullUpdate
);

// PATCH /ehs-incidents/:id
router.patch(
  '/ehs-incidents/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByIncidentId,
  validateBody(incidentPatchSchema),
  controller.partialUpdate
);

// DELETE /ehs-incidents/:id — Admin only, and only while status='open'
// (enforced in the service); incidents under review/closed are part of
// the permanent safety record.
router.delete(
  '/ehs-incidents/:id',
  authenticate,
  requireRole(ROLES.ADMIN),
  ...scopeByIncidentId,
  controller.remove
);

module.exports = router;
