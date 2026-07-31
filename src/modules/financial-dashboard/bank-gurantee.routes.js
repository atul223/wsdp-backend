
const express = require('express');
const controller = require('./bank-guarantee.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'financial_dashboard';

router.get(
  '/projects/:projectId/bank-guarantees',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.listProjectBankGuarantees
);

router.post(
  '/projects/:projectId/bank-guarantees',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  controller.createProjectBankGuarantee
);

router.put(
  '/bank-guarantees/:guaranteeId',
  authenticate,
  requirePermission(MODULE, 'update'),
  controller.updateProjectBankGuarantee
);

router.delete(
  '/bank-guarantees/:guaranteeId',
  authenticate,
  requirePermission(MODULE, 'delete'),
  controller.deleteProjectBankGuarantee
);

module.exports = router;