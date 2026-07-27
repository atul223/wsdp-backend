const service = require('./dashboard.service');
const { success } = require('../../common/responses/apiResponse');

async function getDefaultProject(req, res, next) {
  try {
    const data = await service.getDefaultProject(req.user);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    const data = await service.getDashboard(
      req.params.projectId,
      req.user
    );

    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/* =========================
   PIPELINE
========================= */

async function createPipelineSection(req, res, next) {
  try {
    const data = await service.createPipelineSection(req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function updatePipelineSection(req, res, next) {
  try {
    const data = await service.updatePipelineSection(
      req.params.id,
      req.body
    );

    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function deletePipelineSection(req, res, next) {
  try {
    await service.deletePipelineSection(req.params.id);
    return success(res, { message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

/* =========================
   HOUSE CLUSTER
========================= */

async function createHouseCluster(req, res, next) {
  try {
    const data = await service.createHouseCluster(req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function updateHouseCluster(req, res, next) {
  try {
    const data = await service.updateHouseCluster(
      req.params.id,
      req.body
    );

    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function deleteHouseCluster(req, res, next) {
  try {
    await service.deleteHouseCluster(req.params.id);
    return success(res, { message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

/* =========================
   TESTING
========================= */

async function createTestingActivity(req, res, next) {
  try {
    const data = await service.createTestingActivity(req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function updateTestingActivity(req, res, next) {
  try {
    const data = await service.updateTestingActivity(
      req.params.id,
      req.body
    );

    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function deleteTestingActivity(req, res, next) {
  try {
    await service.deleteTestingActivity(req.params.id);
    return success(res, { message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

/* =========================
   BRIDGE
========================= */

async function createBridgeCrossing(req, res, next) {
  try {
    const data = await service.createBridgeCrossing(req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function updateBridgeCrossing(req, res, next) {
  try {
    const data = await service.updateBridgeCrossing(
      req.params.id,
      req.body
    );

    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function deleteBridgeCrossing(req, res, next) {
  try {
    await service.deleteBridgeCrossing(req.params.id);
    return success(res, { message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

/* =========================
   VALVE SUMMARY
========================= */

async function updateValveSummary(req, res, next) {
  try {
    const data = await service.updateValveSummary(
      req.params.projectId,
      req.body
    );

    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDefaultProject,
  getDashboard,

  createPipelineSection,
  updatePipelineSection,
  deletePipelineSection,

  createHouseCluster,
  updateHouseCluster,
  deleteHouseCluster,

  createTestingActivity,
  updateTestingActivity,
  deleteTestingActivity,

  createBridgeCrossing,
  updateBridgeCrossing,
  deleteBridgeCrossing,

  updateValveSummary,
};