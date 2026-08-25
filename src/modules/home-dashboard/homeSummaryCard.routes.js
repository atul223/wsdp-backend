/* ============================================================
   home-dashboard/homeSummaryCard.routes.js
   Mounted in app.js under '/api/v1'.

   NOTE ON MIDDLEWARE NAMES: this follows the `authenticate` /
   `authorize(module, action)` convention documented in your
   auth-system-design.md. If your actual middlewares/auth.middleware.js
   and middlewares/role.middleware.js export different function names,
   just adjust the two require() lines below — nothing else changes.
   ============================================================ */

const express = require('express');
const router = express.Router();

const controller = require('./homeSummaryCard.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const MODULE = 'home_dashboard';

router.get(
  '/projects/:projectId/home-summary-cards',
  authenticate,
  authorize(MODULE, 'read'),
  controller.getCards
);

router.put(
  '/projects/:projectId/home-summary-cards/:cardKey',
  authenticate,
  authorize(MODULE, 'update'),
  controller.upsertCard
);

router.delete(
  '/projects/:projectId/home-summary-cards/:cardKey',
  authenticate,
  authorize(MODULE, 'delete'),
  controller.deleteCard
);

router.post(
  '/projects/:projectId/home-summary-cards/import',
  authenticate,
  authorize(MODULE, 'update'),
  controller.importCards
);

module.exports = router;
