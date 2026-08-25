/* ============================================================
   home-dashboard/homeSummaryCard.controller.js
   Parses request, calls service, formats the standard response
   envelope { success, data, message }.
   ============================================================ */

const service = require('./homeSummaryCard.service');
const { upsertCardSchema, importCardsSchema } = require('./homeSummaryCard.validation');

async function getCards(req, res, next) {
  try {
    const { projectId } = req.params;
    const data = await service.listCards(projectId);
    res.status(200).json({ success: true, data, message: '' });
  } catch (err) {
    next(err);
  }
}

async function upsertCard(req, res, next) {
  try {
    const { projectId, cardKey } = req.params;
    const parsed = upsertCardSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: parsed.error.flatten() },
      });
    }

    const userId = req.user ? req.user.id || req.user.sub : null;
    const data = await service.upsertCard(projectId, cardKey, parsed.data, userId);

    res.status(200).json({ success: true, data, message: 'Card updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function deleteCard(req, res, next) {
  try {
    const { projectId, cardKey } = req.params;
    await service.deleteCard(projectId, cardKey);
    res.status(200).json({ success: true, data: null, message: 'Card reset to default' });
  } catch (err) {
    next(err);
  }
}

async function importCards(req, res, next) {
  try {
    const { projectId } = req.params;
    const parsed = importCardsSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: parsed.error.flatten() },
      });
    }

    const userId = req.user ? req.user.id || req.user.sub : null;
    const result = await service.importCards(projectId, parsed.data.cards, userId);

    res.status(200).json({
      success: true,
      data: result,
      message: result.applied.length + ' card(s) updated' + (result.skipped.length ? ', ' + result.skipped.length + ' skipped' : ''),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCards,
  upsertCard,
  deleteCard,
  importCards,
};
