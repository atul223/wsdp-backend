/* ============================================================
   home-dashboard/homeSummaryCard.validation.js
   Zod schemas — same validation-at-controller-boundary pattern
   used by the other modules (financial-dashboard, ehs, etc.).
   ============================================================ */

const { z } = require('zod');

// Keep this list in sync with HOME_CARD_META in js/home-dashboard.js
const VALID_CARD_KEYS = [
  'overall_physical_progress',
  'pipe_laying',
  'household_connections',
  'months_elapsed_remaining',
  'cumulative_billing',
  'ipc_status',
  'eshs_compliance',
  'lost_time_accidents',
  'grievances_resolved',
  'active_work_fronts',
];

const upsertCardSchema = z.object({
  value_type: z.enum(['percent', 'number', 'text']),
  value_number: z.number().finite().nullable().optional(),
  value_text: z.string().max(200).nullable().optional(),
  delta_text: z.string().max(200).nullable().optional(),
  decimals: z.number().int().min(0).max(4).optional(),
});

const importCardsSchema = z.object({
  cards: z
    .array(
      z.object({
        card_key: z.string().min(1),
        value_type: z.enum(['percent', 'number', 'text']).optional(),
        value_number: z.union([z.number(), z.string(), z.null()]).optional(),
        value_text: z.string().max(200).nullable().optional(),
        delta_text: z.string().max(200).nullable().optional(),
        decimals: z.union([z.number(), z.string()]).optional(),
      })
    )
    .min(1),
});

function isValidCardKey(cardKey) {
  return VALID_CARD_KEYS.includes(cardKey);
}

module.exports = {
  VALID_CARD_KEYS,
  upsertCardSchema,
  importCardsSchema,
  isValidCardKey,
};
