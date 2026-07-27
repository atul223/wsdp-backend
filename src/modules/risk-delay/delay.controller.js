const service = require('./delay.service');
const { success, created, noContent } = require('../../common/responses/apiResponse');

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || null;
}

async function list(req, res, next) {
  try {
    const { data, meta } = await service.listByProject(req.params.projectId, req);
    return success(res, { data, meta });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const data = await service.getById(req.params.id);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await service.create({
      projectId: req.params.projectId,
      payload: req.validatedBody,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });
    return created(res, { data, message: 'Delay record created successfully' });
  } catch (err) {
    next(err);
  }
}

async function fullUpdate(req, res, next) {
  try {
    const data = await service.fullUpdate({
      id: req.params.id,
      payload: req.validatedBody,
      userId: req.user.id,
      userRole: req.user.role,
      ipAddress: getClientIp(req),
    });
    return success(res, { data, message: 'Delay record updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function partialUpdate(req, res, next) {
  try {
    const data = await service.partialUpdate({
      id: req.params.id,
      payload: req.validatedBody,
      userId: req.user.id,
      userRole: req.user.role,
      ipAddress: getClientIp(req),
    });
    return success(res, { data, message: 'Delay record updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await service.remove({ id: req.params.id, userId: req.user.id, ipAddress: getClientIp(req) });
    return noContent(res);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, fullUpdate, partialUpdate, remove };
