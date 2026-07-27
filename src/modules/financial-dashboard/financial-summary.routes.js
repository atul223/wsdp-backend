

const express = require('express');
const controller = require('./financial-summary.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'financial_dashboard';

router.get(
  '/projects/:projectId/financial-summary',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.getProjectSummary
);

module.exports = router;