/**
 * src/modules/construction-progress/dashboard.routes.js
 *
 * *** SECURITY FIX ***
 * Every mutating route in this file (all POST/PUT/DELETE below)
 * previously had ONLY `authenticate` on it — no requirePermission(),
 * no requireRole(), no project-scope check. That meant ANY logged-in
 * user of ANY role could create/edit/delete Pipeline Sections, House
 * Clusters, Testing Activities, Bridge Crossings, Valve/Pipeline/House
 * Summaries, and Area/Pipe-Diameter/Activity-Wise Progress rows for
 * ANY project directly via the API, regardless of what the frontend UI
 * shows or hides. This is fixed below by adding the same
 * requirePermission(module, action) + scopeBy*Id + requireRole (for
 * deletes) pattern already used consistently in workPackage.routes.js,
 * progressEntry.routes.js, and every resource-dashboard route file.
 *
 * GET routes unchanged in shape — `getDashboard`'s underlying service
 * (dashboard.service.js) already enforces per-project access via
 * canAccessProject()/GLOBAL_SCOPE_ROLES; requirePermission('read') is
 * added here too as a first line of defense, consistent with every
 * other module.
 *
 * No endpoint paths, controller functions, or response shapes changed.
 */
const express = require('express');
const router = express.Router();

const controller = require('./dashboard.controller');

const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireRole } = require('../../middlewares/role.middleware');
const { ROLES } = require('../../common/constants/roles');
const {
  scopeByPipelineSectionId,
  scopeByHouseClusterId,
  scopeByTestingActivityId,
  scopeByBridgeCrossingId,
  scopeByAreaProgressId,
  scopeByPipeDiameterProgressId,
  scopeByActivityProgressId,
  scopeByBodyProjectId,
  scopeByParamProjectId,
} = require('./dashboard.middleware');

const MODULE = 'construction_progress';

router.get(
  '/default-project',
  authenticate,
  controller.getDefaultProject
);

router.get(
  '/dashboard/:projectId',
  authenticate,
  requirePermission(MODULE, 'read'),
  controller.getDashboard
);

/* =========================
   PIPELINE SECTIONS
========================= */

router.post(
  '/pipeline-section',
  authenticate,
  requirePermission(MODULE, 'create'),
  scopeByBodyProjectId,
  controller.createPipelineSection
);

router.put(
  '/pipeline-section/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByPipelineSectionId,
  controller.updatePipelineSection
);

router.delete(
  '/pipeline-section/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByPipelineSectionId,
  controller.deletePipelineSection
);

/* =========================
   HOUSE CLUSTERS
========================= */

router.post(
  '/house-cluster',
  authenticate,
  requirePermission(MODULE, 'create'),
  scopeByBodyProjectId,
  controller.createHouseCluster
);

router.put(
  '/house-cluster/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByHouseClusterId,
  controller.updateHouseCluster
);

router.delete(
  '/house-cluster/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByHouseClusterId,
  controller.deleteHouseCluster
);

/* =========================
   TESTING ACTIVITIES (Pressure Testing Status)
========================= */

router.post(
  '/testing-activity',
  authenticate,
  requirePermission(MODULE, 'create'),
  scopeByBodyProjectId,
  controller.createTestingActivity
);

router.put(
  '/testing-activity/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByTestingActivityId,
  controller.updateTestingActivity
);

router.delete(
  '/testing-activity/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByTestingActivityId,
  controller.deleteTestingActivity
);

/* =========================
   BRIDGE CROSSINGS (Bridge-Crossing Structure Progress)
========================= */

router.post(
  '/bridge-crossing',
  authenticate,
  requirePermission(MODULE, 'create'),
  scopeByBodyProjectId,
  controller.createBridgeCrossing
);

router.put(
  '/bridge-crossing/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByBridgeCrossingId,
  controller.updateBridgeCrossing
);

router.delete(
  '/bridge-crossing/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByBridgeCrossingId,
  controller.deleteBridgeCrossing
);

/* =========================
   VALVE SUMMARY (Valve Chamber Construction Progress)
========================= */

router.put(
  '/valve-summary/:projectId',
  authenticate,
  requirePermission(MODULE, 'update'),
  scopeByParamProjectId,
  controller.updateValveSummary
);

/* =========================
   AREA-WISE PROGRESS
========================= */

router.post(
  '/area-progress',
  authenticate,
  requirePermission(MODULE, 'create'),
  scopeByBodyProjectId,
  controller.createAreaProgress
);

router.put(
  '/area-progress/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByAreaProgressId,
  controller.updateAreaProgress
);

router.delete(
  '/area-progress/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByAreaProgressId,
  controller.deleteAreaProgress
);

/* =========================
   PIPE DIAMETER WISE PROGRESS
========================= */

router.post(
  '/pipe-diameter-progress',
  authenticate,
  requirePermission(MODULE, 'create'),
  scopeByBodyProjectId,
  controller.createPipeDiameterProgress
);

router.put(
  '/pipe-diameter-progress/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByPipeDiameterProgressId,
  controller.updatePipeDiameterProgress
);

router.delete(
  '/pipe-diameter-progress/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByPipeDiameterProgressId,
  controller.deletePipeDiameterProgress
);

/* =========================
   ACTIVITY WISE PROGRESS
========================= */

router.post(
  '/activity-progress',
  authenticate,
  requirePermission(MODULE, 'create'),
  scopeByBodyProjectId,
  controller.createActivityProgress
);

router.put(
  '/activity-progress/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByActivityProgressId,
  controller.updateActivityProgress
);

router.delete(
  '/activity-progress/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByActivityProgressId,
  controller.deleteActivityProgress
);

/* =========================
   PIPELINE / HOUSE SUMMARY (KPI card overrides)
========================= */

router.put(
  '/pipeline-summary/:projectId',
  authenticate,
  requirePermission(MODULE, 'update'),
  scopeByParamProjectId,
  controller.updatePipelineSummary
);

router.put(
  '/house-summary/:projectId',
  authenticate,
  requirePermission(MODULE, 'update'),
  scopeByParamProjectId,
  controller.updateHouseSummary
);

module.exports = router;
