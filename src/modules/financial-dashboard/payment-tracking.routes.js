const express = require('express');
const controller = require('./payment-tracking.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'financial_dashboard';

/**
 * NOTE: This route file follows the exact same structure as
 * amendment.routes.js and bank-guarantee.routes.js so it is
 * consistent with the rest of the financial_dashboard module.
 * It requires the new PaymentTrackingItem model (see schema.prisma
 * diff + migration.sql provided alongside this file).
 *
 * File name: rename this file to payment-tracking.routes.js
 * once saved locally in your modules/financial/ folder, to match
 * the naming convention of your other route files
 * (amendment.routes.js, bank-guarantee.routes.js, etc.).
 */

router.get(
  '/projects/:projectId/payment-tracking',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.listProjectPaymentTracking
);

router.post(
  '/projects/:projectId/payment-tracking',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  controller.createProjectPaymentTracking
);

router.put(
  '/payment-tracking/:paymentTrackingId',
  authenticate,
  requirePermission(MODULE, 'update'),
  controller.updateProjectPaymentTracking
);

router.delete(
  '/payment-tracking/:paymentTrackingId',
  authenticate,
  requirePermission(MODULE, 'delete'),
  controller.deleteProjectPaymentTracking
);

module.exports = router;
