const service = require('./ehsImport.service');
const { success } = require('../../common/responses/apiResponse');

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || null;
}

async function getTargets(req, res, next) {
  try {
    const data = service.getImportTargets();
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

async function importRows(req, res, next) {
  try {
    const { table, rows } = req.body;
    const data = await service.importRows({
      projectId: req.params.projectId,
      table,
      rows,
      userId: req.user.id,
      ipAddress: getClientIp(req),
    });
    return success(res, { data, message: `Import finished: ${data.created} added, ${data.failed} failed` });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTargets, importRows };
