
const express = require('express');
const controller = require('./amendment.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'financial_dashboard';

router.get(
  '/projects/:projectId/amendments',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.listProjectAmendments
);

router.post(
  '/projects/:projectId/amendments',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  controller.createProjectAmendment
);

router.put(
  '/amendments/:amendmentId',
  authenticate,
  requirePermission(MODULE, 'update'),
  controller.updateProjectAmendment
);

router.delete(
  '/amendments/:amendmentId',
  authenticate,
  requirePermission(MODULE, 'delete'),
  controller.deleteProjectAmendment
);

module.exports = router;