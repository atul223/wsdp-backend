
const service = require('./financial-summary.service');
const { success } = require('../../common/responses/apiResponse');

async function getProjectSummary(req, res, next) {
  try {
    const data = await service.getProjectFinancialSummary(req.params.projectId);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjectSummary,
};