
const service = require('./ipc-tracker.service');
const { success } = require('../../common/responses/apiResponse');

/**
 * GET /projects/:projectId/ipc-tracker
 */
async function listProjectIpcs(req, res, next) {
  try {
    const data = await service.list(req.params.projectId);

    return success(res, {
      data
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /projects/:projectId/ipc-tracker
 */
async function createProjectIpc(req, res, next) {
  try {
    const data = await service.create(
      req.params.projectId,
      req.body
    );

    return success(
      res,
      {
        data
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /ipc-tracker/:ipcId
 */
async function updateProjectIpc(req, res, next) {
  try {
    const data = await service.update(
      req.params.ipcId,
      req.body
    );

    return success(res, {
      data
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /ipc-tracker/:ipcId
 */
async function deleteProjectIpc(req, res, next) {
  try {
    const data = await service.remove(
      req.params.ipcId
    );

    return success(res, {
      data
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjectIpcs,
  createProjectIpc,
  updateProjectIpc,
  deleteProjectIpc
};