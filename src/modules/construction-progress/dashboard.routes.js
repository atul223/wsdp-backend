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
   TESTING ACTIVITIES
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
   BRIDGE CROSSINGS
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
   VALVE SUMMARY
========================= */

router.put(
  '/valve-summary/:projectId',
  authenticate,
  controller.updateValveSummary
);

module.exports = router;