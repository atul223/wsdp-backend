/**
 * src/modules/home-dashboard/homeSummaryCard.routes.js
 *
 * *** SECURITY FIX / REWIRE ***
 * The previous version of this file worked around a 403 you were
 * hitting ("Role 'admin' cannot update 'home_dashboard'") by writing a
 * fully self-contained, hardcoded role check (`requireRole` defined
 * inline in this file) that completely bypassed role.middleware.js's
 * central requirePermission()/role_permissions system. Two problems
 * with that approach, now both fixed:
 *
 *  1. It was a symptom fix, not a root-cause fix — the REAL problem was
 *     that 'home_dashboard' had never been added to the `permissions`
 *     table (see prisma/seed.js MODULES array). It's added there now,
 *     so the central system works correctly and this file no longer
 *     needs its own bypass.
 *  2. It had NO project-scoping at all — any authenticated user could
 *     read or write ANY project's home-summary-cards just by changing
 *     the :projectId in the URL, since only role was checked, never
 *     project membership. Fixed below with the same requireProjectScope
 *     pattern used everywhere else in the app.
 *
 * IMPORTANT DEPLOY ORDER: this file depends on the updated prisma/seed.js
 * (adds the 'home_dashboard' module + role grants). You MUST run
 * `npm run prisma:seed` with the new seed.js BEFORE deploying this
 * routes file, otherwise requirePermission('home_dashboard', ...) will
 * find no matching rows and return 403 for EVERY role, including admin.
 *
 * Read access: same roles that can read every other dashboard (all 7
 * roles, per prisma/seed.js). Write access (update/delete/import):
 * admin (wildcard) + project_manager only, matching the access level
 * PM has on every other module — same effective behavior as before,
 * just now driven by the real permission system instead of a hardcoded
 * list in this file.
 */
const express = require('express');
const router = express.Router();

const controller = require('./homeSummaryCard.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const MODULE = 'home_dashboard';

const scopeByParamProjectId = requireProjectScope((req) => req.params.projectId);

router.get(
  '/projects/:projectId/home-summary-cards',
  authenticate,
  requirePermission(MODULE, 'read'),
  scopeByParamProjectId,
  controller.getCards
);

router.put(
  '/projects/:projectId/home-summary-cards/:cardKey',
  authenticate,
  requirePermission(MODULE, 'update'),
  scopeByParamProjectId,
  controller.upsertCard
);

router.delete(
  '/projects/:projectId/home-summary-cards/:cardKey',
  authenticate,
  requirePermission(MODULE, 'update'),
  scopeByParamProjectId,
  controller.deleteCard
);

router.post(
  '/projects/:projectId/home-summary-cards/import',
  authenticate,
  requirePermission(MODULE, 'update'),
  scopeByParamProjectId,
  controller.importCards
);

module.exports = router;
