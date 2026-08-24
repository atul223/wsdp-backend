const service = require('./report.service');
const { success, created, noContent } = require('../../common/responses/apiResponse');

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || null;
}

async function getDefaultProject(req, res, next) {
  try {
    const data = await service.getDefaultProjectForUser(req.user);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { data, meta } = await service.listByProject(req.params.projectId, req);
    return success(res, { data, meta });
  } catch (err) {
    next(err);
  }
}

async function library(req, res, next) {
  try {
    const data = await service.listLibraryByProject(req.params.projectId);
    return success(res, { data });
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

async function createReport(req, res, next) {
  try {
    const data = await service.create({
      projectId: req.params.projectId,
      payload: req.validatedBody,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });

    return created(res, {
      data,
      message: 'Report created successfully',
    });
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
      ipAddress: getClientIp(req),
    });

    return success(res, {
      data,
      message: 'Report updated successfully',
    });
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
      ipAddress: getClientIp(req),
    });

    return success(res, {
      data,
      message: 'Report updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await service.remove({
      id: req.params.id,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });

    return noContent(res);
  } catch (err) {
    next(err);
  }
}

async function exportOne(req, res, next) {
  try {
    const data = await service.exportReport({
      id: req.params.id,
      format: req.query.format,
    });

    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------
   Periodic Reports — full CRUD
   ------------------------------------------------------------------ */

async function createPeriodicReport(req, res, next) {
  try {
    const data = await service.createPeriodicReport({
      projectId: req.params.projectId,
      payload: req.validatedBody,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });

    return created(res, {
      data,
      message: 'Periodic report created successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function updatePeriodicReport(req, res, next) {
  try {
    const data = await service.updatePeriodicReport({
      id: req.params.id,
      payload: req.validatedBody,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });

    return success(res, {
      data,
      message: 'Periodic report updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function deletePeriodicReport(req, res, next) {
  try {
    await service.removePeriodicReport({
      id: req.params.id,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });

    return noContent(res);
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------
   Method Statements — full CRUD
   ------------------------------------------------------------------ */

async function createMethodStatement(req, res, next) {
  try {
    const data = await service.createMethodStatement({
      projectId: req.params.projectId,
      payload: req.validatedBody,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });

    return created(res, {
      data,
      message: 'Method statement created successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function updateMethodStatement(req, res, next) {
  try {
    const data = await service.updateMethodStatement({
      id: req.params.id,
      payload: req.validatedBody,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });

    return success(res, {
      data,
      message: 'Method statement updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function deleteMethodStatement(req, res, next) {
  try {
    await service.removeMethodStatement({
      id: req.params.id,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });

    return noContent(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDefaultProject,
  list,
  library,
  getOne,
  createReport,
  fullUpdate,
  partialUpdate,
  remove,
  exportOne,
  createPeriodicReport,
  updatePeriodicReport,
  deletePeriodicReport,
  createMethodStatement,
  updateMethodStatement,
  deleteMethodStatement,
};
