const express = require('express');
const controller = require('./report.controller');
const {
  reportCreateSchema,
  reportPutSchema,
  reportPatchSchema,
  periodicReportCreateSchema,
  periodicReportUpdateSchema,
  methodStatementCreateSchema,
  methodStatementUpdateSchema,
  validateBody,
} = require('./report.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const {
  requirePermission,
  requireProjectScope,
  requireRole,
} = require('../../middlewares/role.middleware');
const {
  scopeByReportId,
  scopeByPeriodicReportId,
  scopeByMethodStatementId,
} = require('./report.middleware');
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

/* ------------------------------------------------------------------
   Periodic Reports — full CRUD
   ------------------------------------------------------------------ */

router.post(
  '/projects/:projectId/reports/periodic',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(periodicReportCreateSchema),
  controller.createPeriodicReport
);

router.put(
  '/reports/periodic/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByPeriodicReportId,
  validateBody(periodicReportUpdateSchema),
  controller.updatePeriodicReport
);

router.delete(
  '/reports/periodic/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByPeriodicReportId,
  controller.deletePeriodicReport
);

/* ------------------------------------------------------------------
   Method Statements — full CRUD
   ------------------------------------------------------------------ */

router.post(
  '/projects/:projectId/reports/method-statements',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(methodStatementCreateSchema),
  controller.createMethodStatement
);

router.put(
  '/reports/method-statements/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByMethodStatementId,
  validateBody(methodStatementUpdateSchema),
  controller.updateMethodStatement
);

router.delete(
  '/reports/method-statements/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByMethodStatementId,
  controller.deleteMethodStatement
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
