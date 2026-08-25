const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');

/**
 * financial-summary-card.service.js
 *
 * Backs full CRUD (create-on-first-edit / update / delete-to-reset) for
 * the 8 KPI cards on the Financial Dashboard:
 *   financial_progress_pct, physical_progress_pct, cumulative_expenditure,
 *   ipc_status, total_contract, advance_payment_20, contract_balance,
 *   prov_sum_15
 *
 * Each card is stored generically (valuePrimary/valueSecondary/valueText/
 * subText/noteText) so one table + one route set covers every card type
 * (money pairs, percentages, and free-text status cards) without needing
 * a bespoke table per card.
 */

const VALID_CARD_KEYS = [
  'financial_progress_pct',
  'physical_progress_pct',
  'cumulative_expenditure',
  'ipc_status',
  'total_contract',
  'advance_payment_20',
  'contract_balance',
  'prov_sum_15',
];

// Hard defaults used ONLY when no override row exists yet for a project.
// These match the values your dashboard has always shown, so nothing
// regresses for projects that haven't set an override yet.
const CARD_DEFAULTS = {
  financial_progress_pct: { valuePrimary: null, noteText: 'Cumulation of both IPC-01 and IPC-02' },
  physical_progress_pct: { valuePrimary: 19.36, noteText: 'Overall physical work progress from the average of activities' },
  cumulative_expenditure: { valuePrimary: 651.00, valueSecondary: 1.01, noteText: 'of USD 5.60M contract value' },
  ipc_status: {
    valueText: 'IPC-02',
    subText: '(Withhold by Employer due to Quality of Work)',
    noteText: 'IPC-01 released, IPC-02 Withhold',
  },
  total_contract: { valuePrimary: 3625.58, valueSecondary: 5.60, noteText: 'Contract value in AOA and USD' },
  advance_payment_20: { valuePrimary: 725.12, valueSecondary: 1.12, noteText: 'Advance payment disbursed' },
  contract_balance: { valuePrimary: 2974.58, valueSecondary: 4.59, noteText: 'Remaining contract balance' },
  prov_sum_15: {
    valuePrimary: 472.90,
    valueSecondary: 0.73,
    noteText: '3,000 USD is claimed in IPC-02. Available balance is 727,396.24 USD.',
  },
};

function assertValidCardKey(cardKey) {
  if (!VALID_CARD_KEYS.includes(cardKey)) {
    throw AppError.badRequest(
      `Unknown card_key "${cardKey}". Valid values: ${VALID_CARD_KEYS.join(', ')}`,
      'INVALID_CARD_KEY'
    );
  }
}

function toApiShape(row) {
  return {
    id: row.id,
    card_key: row.cardKey,
    value_primary: row.valuePrimary !== null && row.valuePrimary !== undefined ? Number(row.valuePrimary) : null,
    value_secondary: row.valueSecondary !== null && row.valueSecondary !== undefined ? Number(row.valueSecondary) : null,
    value_text: row.valueText || null,
    sub_text: row.subText || null,
    note_text: row.noteText || null,
    is_override: true,
    updated_at: row.updatedAt,
  };
}

/** Returns a map of cardKey -> merged (override-or-default) card data, used by financial-summary.service.js */
async function getMergedCardsMap(projectId) {
  const overrides = await prisma.financialSummaryCard.findMany({
    where: { projectId, deletedAt: null },
  });

  const overrideMap = new Map(overrides.map((row) => [row.cardKey, row]));
  const merged = {};

  VALID_CARD_KEYS.forEach((key) => {
    const override = overrideMap.get(key);
    if (override) {
      merged[key] = { ...toApiShape(override), is_override: true };
    } else {
      merged[key] = { ...CARD_DEFAULTS[key], is_override: false };
      merged[key].value_primary = merged[key].valuePrimary ?? null;
      merged[key].value_secondary = merged[key].valueSecondary ?? null;
      merged[key].value_text = merged[key].valueText ?? null;
      merged[key].sub_text = merged[key].subText ?? null;
      merged[key].note_text = merged[key].noteText ?? null;
    }
  });

  return merged;
}

async function upsertCard({ projectId, cardKey, payload }) {
  assertValidCardKey(cardKey);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  const data = {
    valuePrimary: payload.value_primary !== undefined && payload.value_primary !== null && payload.value_primary !== ''
      ? Number(payload.value_primary)
      : null,
    valueSecondary: payload.value_secondary !== undefined && payload.value_secondary !== null && payload.value_secondary !== ''
      ? Number(payload.value_secondary)
      : null,
    valueText: payload.value_text !== undefined ? (payload.value_text || null) : null,
    subText: payload.sub_text !== undefined ? (payload.sub_text || null) : null,
    noteText: payload.note_text !== undefined ? (payload.note_text || null) : null,
  };

  const row = await prisma.financialSummaryCard.upsert({
    where: { projectId_cardKey: { projectId, cardKey } },
    update: { ...data, deletedAt: null },
    create: { projectId, cardKey, ...data },
  });

  return toApiShape(row);
}

/** "Delete" = reset the card back to its computed/default value. */
async function resetCard({ projectId, cardKey }) {
  assertValidCardKey(cardKey);

  const existing = await prisma.financialSummaryCard.findFirst({
    where: { projectId, cardKey, deletedAt: null },
  });

  if (!existing) {
    // Nothing to reset — already at default. Not an error.
    return { card_key: cardKey, is_override: false };
  }

  await prisma.financialSummaryCard.update({
    where: { id: existing.id },
    data: { deletedAt: new Date() },
  });

  return { card_key: cardKey, is_override: false };
}

module.exports = {
  VALID_CARD_KEYS,
  CARD_DEFAULTS,
  getMergedCardsMap,
  upsertCard,
  resetCard,
};
