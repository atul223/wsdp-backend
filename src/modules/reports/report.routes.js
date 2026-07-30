const express = require('express');
const controller = require('./report.controller');
const {
  reportCreateSchema,
  reportPutSchema,
  reportPatchSchema,
  validateBody,
} = require('./report.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const {
  requirePermission,
  requireProjectScope,
  requireRole,
} = require('../../middlewares/role.middleware');
const { scopeByReportId } = require('./report.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'reports';

router.get(
  '/reports/context/default-project',
  authenticate,
  requirePermission(MODULE, 'read'),
  controller.getDefaultProject
);

router.get(
  '/projects/:projectId/reports',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

router.get(
  '/projects/:projectId/reports/library',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.library
);

router.post(
  '/projects/:projectId/reports',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(reportCreateSchema),
  controller.createReport
);

router.get(
  '/reports/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByReportId,
  controller.getOne
);

router.get(
  '/reports/:id/export',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByReportId,
  controller.exportOne
);

router.put(
  '/reports/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByReportId,
  validateBody(reportPutSchema),
  controller.fullUpdate
);

router.patch(
  '/reports/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByReportId,
  validateBody(reportPatchSchema),
  controller.partialUpdate
);

router.delete(
  '/reports/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByReportId,
  controller.remove
);

module.exports = router;