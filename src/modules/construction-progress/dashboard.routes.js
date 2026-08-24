const express = require('express');
const router = express.Router();

const controller = require('./dashboard.controller');

const { authenticate } = require('../../middlewares/auth.middleware');

router.get(
  '/default-project',
  authenticate,
  controller.getDefaultProject
);

router.get(
  '/dashboard/:projectId',
  authenticate,
  controller.getDashboard
);

/* =========================
   PIPELINE SECTIONS
========================= */

router.post(
  '/pipeline-section',
  authenticate,
  controller.createPipelineSection
);

router.put(
  '/pipeline-section/:id',
  authenticate,
  controller.updatePipelineSection
);

router.delete(
  '/pipeline-section/:id',
  authenticate,
  controller.deletePipelineSection
);

/* =========================
   HOUSE CLUSTERS
========================= */

router.post(
  '/house-cluster',
  authenticate,
  controller.createHouseCluster
);

router.put(
  '/house-cluster/:id',
  authenticate,
  controller.updateHouseCluster
);

router.delete(
  '/house-cluster/:id',
  authenticate,
  controller.deleteHouseCluster
);

/* =========================
   TESTING ACTIVITIES (Pressure Testing Status)
========================= */

router.post(
  '/testing-activity',
  authenticate,
  controller.createTestingActivity
);

router.put(
  '/testing-activity/:id',
  authenticate,
  controller.updateTestingActivity
);

router.delete(
  '/testing-activity/:id',
  authenticate,
  controller.deleteTestingActivity
);

/* =========================
   BRIDGE CROSSINGS (Bridge-Crossing Structure Progress)
========================= */

router.post(
  '/bridge-crossing',
  authenticate,
  controller.createBridgeCrossing
);

router.put(
  '/bridge-crossing/:id',
  authenticate,
  controller.updateBridgeCrossing
);

router.delete(
  '/bridge-crossing/:id',
  authenticate,
  controller.deleteBridgeCrossing
);

/* =========================
   VALVE SUMMARY (Valve Chamber Construction Progress)
========================= */

router.put(
  '/valve-summary/:projectId',
  authenticate,
  controller.updateValveSummary
);

/* =========================
   AREA-WISE PROGRESS
========================= */

router.post(
  '/area-progress',
  authenticate,
  controller.createAreaProgress
);

router.put(
  '/area-progress/:id',
  authenticate,
  controller.updateAreaProgress
);

router.delete(
  '/area-progress/:id',
  authenticate,
  controller.deleteAreaProgress
);

/* =========================
   PIPE DIAMETER WISE PROGRESS
========================= */

router.post(
  '/pipe-diameter-progress',
  authenticate,
  controller.createPipeDiameterProgress
);

router.put(
  '/pipe-diameter-progress/:id',
  authenticate,
  controller.updatePipeDiameterProgress
);

router.delete(
  '/pipe-diameter-progress/:id',
  authenticate,
  controller.deletePipeDiameterProgress
);

/* =========================
   ACTIVITY WISE PROGRESS
========================= */

router.post(
  '/activity-progress',
  authenticate,
  controller.createActivityProgress
);

router.put(
  '/activity-progress/:id',
  authenticate,
  controller.updateActivityProgress
);

router.delete(
  '/activity-progress/:id',
  authenticate,
  controller.deleteActivityProgress
);

/* =========================
   PIPELINE / HOUSE SUMMARY (KPI card overrides)
========================= */

router.put(
  '/pipeline-summary/:projectId',
  authenticate,
  controller.updatePipelineSummary
);

router.put(
  '/house-summary/:projectId',
  authenticate,
  controller.updateHouseSummary
);

module.exports = router;
