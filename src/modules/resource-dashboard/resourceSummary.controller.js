const service = require('./resourceSummary.service');
const { success } = require('../../common/responses/apiResponse');

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || null;
}

async function list(req, res, next) {
  try {
    const data = await service.listByProject(req.params.projectId);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function upsert(req, res, next) {
  try {
    const data = await service.upsert({
      projectId: req.params.projectId,
      cardKey: req.params.cardKey,
      payload: req.validatedBody,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });
    return success(res, { data, message: 'Summary card updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function reset(req, res, next) {
  try {
    const data = await service.resetToAuto({
      projectId: req.params.projectId,
      cardKey: req.params.cardKey,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });
    return success(res, { data, message: 'Summary card reset to auto-calculated value' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, upsert, reset };
