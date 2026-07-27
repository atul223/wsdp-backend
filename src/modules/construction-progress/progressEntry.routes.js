const express = require('express');
const controller = require('./progressEntry.controller');
const {
  progressEntryCreateSchema,
  progressEntryPutSchema,
  progressEntryPatchSchema,
  validateBody,
} = require('./constructionProgress.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireRole } = require('../../middlewares/role.middleware');
const { scopeByWorkPackageParam, scopeByProgressEntryId } = require('./constructionProgress.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();

const MODULE = 'construction_progress';

// GET /work-packages/:workPackageId/progress-entries
router.get(
  '/work-packages/:workPackageId/progress-entries',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByWorkPackageParam,
  controller.list
);

// POST /work-packages/:workPackageId/progress-entries
router.post(
  '/work-packages/:workPackageId/progress-entries',
  authenticate,
  requirePermission(MODULE, 'create'),
  ...scopeByWorkPackageParam,
  validateBody(progressEntryCreateSchema),
  controller.create
);

// GET /progress-entries/:id
router.get(
  '/progress-entries/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByProgressEntryId,
  controller.getOne
);

// PUT /progress-entries/:id
// Business rule: Admin/PM may always edit; Site Engineer only within a
// 24h window on their own entries — enforced inside the service, not here.
router.put(
  '/progress-entries/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByProgressEntryId,
  validateBody(progressEntryPutSchema),
  controller.fullUpdate
);

// PATCH /progress-entries/:id
router.patch(
  '/progress-entries/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByProgressEntryId,
  validateBody(progressEntryPatchSchema),
  controller.partialUpdate
);

// DELETE /progress-entries/:id — Admin/Project Manager only
router.delete(
  '/progress-entries/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByProgressEntryId,
  controller.remove
);

module.exports = router;
