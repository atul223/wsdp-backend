const express = require('express');
const controller = require('./ehsInspection.controller');
const {
  inspectionCreateSchema,
  inspectionPutSchema,
  inspectionPatchSchema,
  checklistItemPatchSchema,
  validateBody,
} = require('./ehs.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByInspectionId, scopeByChecklistItemId } = require('./ehs.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'ehs';

// GET /projects/:projectId/ehs-inspections
router.get(
  '/projects/:projectId/ehs-inspections',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

// POST /projects/:projectId/ehs-inspections
router.post(
  '/projects/:projectId/ehs-inspections',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(inspectionCreateSchema),
  controller.create
);

// GET /ehs-inspections/:id
router.get(
  '/ehs-inspections/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByInspectionId,
  controller.getOne
);

// PUT /ehs-inspections/:id
router.put(
  '/ehs-inspections/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByInspectionId,
  validateBody(inspectionPutSchema),
  controller.fullUpdate
);

// PATCH /ehs-inspections/:id
router.patch(
  '/ehs-inspections/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByInspectionId,
  validateBody(inspectionPatchSchema),
  controller.partialUpdate
);

// DELETE /ehs-inspections/:id — Admin/Project Manager only
router.delete(
  '/ehs-inspections/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByInspectionId,
  controller.remove
);

// PATCH /ehs-checklist-items/:itemId — update a single remediation item
// without touching the rest of the inspection.
router.patch(
  '/ehs-checklist-items/:itemId',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByChecklistItemId,
  validateBody(checklistItemPatchSchema),
  controller.updateChecklistItem
);

module.exports = router;
