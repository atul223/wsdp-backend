/* ============================================================
   home-dashboard/homeSummaryCard.service.js
   Business logic + Prisma access (repository pattern, same as
   other modules — no controller ever talks to Prisma directly).
   ============================================================ */

const { PrismaClient } = require('@prisma/client');
const { isValidCardKey } = require('./homeSummaryCard.validation');

const prisma = new PrismaClient();

/** Returns a map keyed by card_key -> override row (only cards that
 *  have actually been edited exist here; the frontend merges this
 *  with its own hardcoded defaults for everything else). */
async function listCards(projectId) {
  const rows = await prisma.homeSummaryCard.findMany({
    where: { projectId },
  });

  const map = {};
  rows.forEach((row) => {
    map[row.cardKey] = serialize(row);
  });

  return map;
}

async function upsertCard(projectId, cardKey, payload, userId) {
  if (!isValidCardKey(cardKey)) {
    const err = new Error('Unknown card_key: ' + cardKey);
    err.status = 400;
    throw err;
  }

  const data = {
    valueType: payload.value_type,
    valueNumber:
      payload.value_number === undefined || payload.value_number === null
        ? null
        : payload.value_number,
    valueText:
      payload.value_text === undefined || payload.value_text === null
        ? null
        : payload.value_text,
    deltaText:
      payload.delta_text === undefined || payload.delta_text === null
        ? null
        : payload.delta_text,
    decimals: payload.decimals === undefined ? 0 : payload.decimals,
    updatedBy: userId || null,
  };

  const row = await prisma.homeSummaryCard.upsert({
    where: { projectId_cardKey: { projectId, cardKey } },
    create: { projectId, cardKey, ...data },
    update: data,
  });

  return serialize(row);
}

async function deleteCard(projectId, cardKey) {
  try {
    await prisma.homeSummaryCard.delete({
      where: { projectId_cardKey: { projectId, cardKey } },
    });
  } catch (err) {
    // P2025 = "record not found" -> resetting a card that has no
    // override yet is a no-op, not an error.
    if (err.code !== 'P2025') throw err;
  }
}

/** Bulk upsert used by the Excel Import flow. Unknown card_keys are
 *  skipped (and reported back) rather than failing the whole import. */
async function importCards(projectId, cards, userId) {
  const applied = [];
  const skipped = [];

  for (const card of cards) {
    const cardKey = String(card.card_key || '').trim();

    if (!isValidCardKey(cardKey)) {
      skipped.push({ card_key: cardKey, reason: 'Unknown card_key' });
      continue;
    }

    const valueType = card.value_type || (isNaN(Number(card.value_number)) ? 'text' : 'percent');

    const data = {
      valueType,
      valueNumber:
        card.value_number !== undefined && card.value_number !== null && card.value_number !== ''
          ? Number(card.value_number)
          : null,
      valueText: card.value_text !== undefined && card.value_text !== null ? String(card.value_text) : null,
      deltaText: card.delta_text !== undefined && card.delta_text !== null ? String(card.delta_text) : null,
      decimals: card.decimals !== undefined && card.decimals !== null && card.decimals !== '' ? Number(card.decimals) : 0,
      updatedBy: userId || null,
    };

    const row = await prisma.homeSummaryCard.upsert({
      where: { projectId_cardKey: { projectId, cardKey } },
      create: { projectId, cardKey, ...data },
      update: data,
    });

    applied.push(serialize(row));
  }

  return { applied, skipped };
}

function serialize(row) {
  return {
    id: row.id,
    card_key: row.cardKey,
    value_type: row.valueType,
    value_number: row.valueNumber !== null && row.valueNumber !== undefined ? Number(row.valueNumber) : null,
    value_text: row.valueText,
    delta_text: row.deltaText,
    decimals: row.decimals,
    updated_at: row.updatedAt,
  };
}

module.exports = {
  listCards,
  upsertCard,
  deleteCard,
  importCards,
};
