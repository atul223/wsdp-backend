const express = require('express');
const controller = require('./workPackage.controller');
const {
  workPackageCreateSchema,
  workPackagePutSchema,
  workPackagePatchSchema,
  validateBody,
} = require('./constructionProgress.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByWorkPackageId } = require('./constructionProgress.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();

const MODULE = 'construction_progress';

// GET /projects/:projectId/work-packages
router.get(
  '/projects/:projectId/work-packages',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

// POST /projects/:projectId/work-packages
router.post(
  '/projects/:projectId/work-packages',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(workPackageCreateSchema),
  controller.create
);

// GET /work-packages/:id
router.get(
  '/work-packages/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByWorkPackageId,
  controller.getOne
);

// PUT /work-packages/:id
router.put(
  '/work-packages/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByWorkPackageId,
  validateBody(workPackagePutSchema),
  controller.fullUpdate
);

// PATCH /work-packages/:id
router.patch(
  '/work-packages/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByWorkPackageId,
  validateBody(workPackagePatchSchema),
  controller.partialUpdate
);

// DELETE /work-packages/:id — Admin/Project Manager only (Planning
// Engineer has module-level delete permission but is intentionally
// excluded here per the business rules: deleting scope items with
// possible progress history is a PM/Admin-level decision).
router.delete(
  '/work-packages/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByWorkPackageId,
  controller.remove
);

module.exports = router;
