const service = require('./dashboard.service');
const { success } = require('../../common/responses/apiResponse');

/**
 * *** ROOT-CAUSE FIX ***
 * Forces every intermediary — browser HTTP cache, Cloudflare edge cache
 * (this stack's frontend is served from a *.workers.dev / Cloudflare
 * domain), any corporate/ISP proxy — to NEVER cache these GET responses.
 *
 * Without this, a cached response from BEFORE a user's Add/Edit can be
 * replayed on refresh, making a successfully-saved row look like it
 * "disappeared" even though it's still safely in the database.
 */
function setNoStore(res) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
}

async function getDefaultProject(req, res, next) {
  try {
    setNoStore(res);
    const data = await service.getDefaultProject(req.user);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    setNoStore(res);
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

/* =========================
   AREA-WISE PROGRESS
========================= */

async function createAreaProgress(req, res, next) {
  try {
    const data = await service.createAreaProgress(req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function updateAreaProgress(req, res, next) {
  try {
    const data = await service.updateAreaProgress(req.params.id, req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function deleteAreaProgress(req, res, next) {
  try {
    await service.deleteAreaProgress(req.params.id);
    return success(res, { message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

/* =========================
   PIPE DIAMETER WISE PROGRESS
========================= */

async function createPipeDiameterProgress(req, res, next) {
  try {
    const data = await service.createPipeDiameterProgress(req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function updatePipeDiameterProgress(req, res, next) {
  try {
    const data = await service.updatePipeDiameterProgress(req.params.id, req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function deletePipeDiameterProgress(req, res, next) {
  try {
    await service.deletePipeDiameterProgress(req.params.id);
    return success(res, { message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

/* =========================
   ACTIVITY WISE PROGRESS
========================= */

async function createActivityProgress(req, res, next) {
  try {
    const data = await service.createActivityProgress(req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function updateActivityProgress(req, res, next) {
  try {
    const data = await service.updateActivityProgress(req.params.id, req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function deleteActivityProgress(req, res, next) {
  try {
    await service.deleteActivityProgress(req.params.id);
    return success(res, { message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

/* =========================
   PIPELINE / HOUSE SUMMARY (KPI cards)
========================= */

async function updatePipelineSummary(req, res, next) {
  try {
    const data = await service.updatePipelineSummary(req.params.projectId, req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function updateHouseSummary(req, res, next) {
  try {
    const data = await service.updateHouseSummary(req.params.projectId, req.body);
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

  createAreaProgress,
  updateAreaProgress,
  deleteAreaProgress,

  createPipeDiameterProgress,
  updatePipeDiameterProgress,
  deletePipeDiameterProgress,

  createActivityProgress,
  updateActivityProgress,
  deleteActivityProgress,

  updatePipelineSummary,
  updateHouseSummary,
};
