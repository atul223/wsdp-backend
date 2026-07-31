
const express = require('express');
const controller = require('./ipc-tracker.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'financial_dashboard';

router.get(
  '/projects/:projectId/ipc-tracker',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.listProjectIpcs
);

router.post(
  '/projects/:projectId/ipc-tracker',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  controller.createProjectIpc
);

router.put(
  '/projects/:projectId/ipc-tracker/:ipcId',
  authenticate,
  requirePermission(MODULE, 'update'),
  controller.updateProjectIpc
);

router.delete(
  '/ipc-tracker/:ipcId',
  authenticate,
  requirePermission(MODULE, 'delete'),
  controller.deleteProjectIpc
);

module.exports = router;