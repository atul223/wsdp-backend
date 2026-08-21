const service = require('./riskDelaySummary.service');
const { success } = require('../../common/responses/apiResponse');

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || null;
}

async function getOne(req, res, next) {
  try {
    const data = await service.getByProject(req.params.projectId);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function upsert(req, res, next) {
  try {
    const data = await service.upsert({
      projectId: req.params.projectId,
      payload: req.validatedBody,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });
    return success(res, { data, message: 'Summary cards updated successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOne, upsert };
