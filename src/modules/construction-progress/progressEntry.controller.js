const service = require('./progressEntry.service');
const { success, created, noContent } = require('../../common/responses/apiResponse');
const { ROLES } = require('../../common/constants/roles');

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || null;
}

function getForceFlag(req) {
  // Only Admins may bypass the date-range business rule, even if the
  // query param is present for another role.
  return req.query.force === 'true' && req.user.role === ROLES.ADMIN;
}

async function list(req, res, next) {
  try {
    const { data, meta } = await service.listByWorkPackage(req.params.workPackageId, req);
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
      workPackageId: req.params.workPackageId,
      payload: req.validatedBody,
      userId: req.user.id,
      userRole: req.user.role,
      ipAddress: getClientIp(req),
      force: getForceFlag(req),
    });
    return created(res, { data, message: 'Progress entry logged successfully' });
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
      force: getForceFlag(req),
    });
    return success(res, { data, message: 'Progress entry updated successfully' });
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
    return success(res, { data, message: 'Progress entry updated successfully' });
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
