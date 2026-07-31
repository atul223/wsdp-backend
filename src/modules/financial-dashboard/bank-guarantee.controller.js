
const service = require('./bank-guarantee.service');
const { success } = require('../../common/responses/apiResponse');

async function listProjectBankGuarantees(req, res, next) {
  try {
    const data = await service.list(req.params.projectId);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function createProjectBankGuarantee(req, res, next) {
  try {
    const data = await service.create(req.params.projectId, req.body);
    return success(res, { data }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateProjectBankGuarantee(req, res, next) {
  try {
    const data = await service.update(req.params.guaranteeId, req.body);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function deleteProjectBankGuarantee(req, res, next) {
  try {
    const data = await service.remove(req.params.guaranteeId);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjectBankGuarantees,
  createProjectBankGuarantee,
  updateProjectBankGuarantee,
  deleteProjectBankGuarantee,
};