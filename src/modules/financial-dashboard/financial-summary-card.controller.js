const service = require('./financial-summary-card.service');
const { success } = require('../../common/responses/apiResponse');

async function updateCard(req, res, next) {
  try {
    const { projectId, cardKey } = req.params;
    const data = await service.upsertCard({
      projectId,
      cardKey,
      payload: req.body,
    });
    return success(res, { data, message: 'Summary card updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function resetCard(req, res, next) {
  try {
    const { projectId, cardKey } = req.params;
    const data = await service.resetCard({ projectId, cardKey });
    return success(res, { data, message: 'Summary card reset to default successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateCard, resetCard };
