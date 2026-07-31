
const service = require('./amendment.service');
const { success } = require('../../common/responses/apiResponse');

async function listProjectAmendments(req, res, next) {
  try {
    const data = await service.list(req.params.projectId);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function createProjectAmendment(req, res, next) {
  try {
    const data = await service.create(req.params.projectId, req.body);
    return success(res, { data }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateProjectAmendment(req, res, next) {
  try {
    const data = await service.update(req.params.amendmentId, req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function deleteProjectAmendment(req, res, next) {
  try {
    const data = await service.remove(req.params.amendmentId);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjectAmendments,
  createProjectAmendment,
  updateProjectAmendment,
  deleteProjectAmendment,
};