// Fixed classification values for the Risk & Delay module — same
// in-code-constant approach used for EHS and Construction Progress
// (validated via Zod enums, not DB-backed lookup tables for now).

const RISK_CATEGORIES = [
  'technical',
  'financial',
  'contractual',
  'environmental',
  'geopolitical',
  'weather',
  'other',
];

const RISK_LEVELS = ['low', 'medium', 'high'];

const RISK_STATUSES = ['open', 'mitigated', 'closed'];

// Forward-only status progression, mirroring the EHS incident pattern.
// Moving backward (e.g., closed -> open) requires Admin.
const RISK_STATUS_FORWARD_TRANSITIONS = {
  open: ['mitigated', 'closed'],
  mitigated: ['closed'],
  closed: [],
};

// Delays longer than this many days require a root_cause to be recorded.
const DELAY_ROOT_CAUSE_THRESHOLD_DAYS = 7;

module.exports = {
  RISK_CATEGORIES,
  RISK_LEVELS,
  RISK_STATUSES,
  RISK_STATUS_FORWARD_TRANSITIONS,
  DELAY_ROOT_CAUSE_THRESHOLD_DAYS,
};
