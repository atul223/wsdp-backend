const service = require('./ehsExport.service');
const { success } = require('../../common/responses/apiResponse');

async function getSnapshot(req, res, next) {
  try {
    const data = await service.getExportSnapshot(req.params.projectId);
    return success(res, { data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSnapshot };
