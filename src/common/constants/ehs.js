// Fixed classification values for the EHS module. Kept as in-code
// constants (validated via Zod enums) rather than DB-backed lookup
// tables, consistent with how the Construction Progress module was
// implemented — a dedicated lookup-table migration can replace these
// later without changing the API contract.

const INCIDENT_TYPES = [
  'fall',
  'equipment',
  'electrical',
  'excavation',
  'vehicle',
  'environmental',
  'other',
];

const INCIDENT_SEVERITIES = ['low', 'medium', 'high', 'critical'];

const INCIDENT_STATUSES = ['open', 'under_review', 'closed'];

// Forward-only status progression. Moving backward (e.g., closed -> open)
// requires Admin.
const INCIDENT_STATUS_FORWARD_TRANSITIONS = {
  open: ['under_review', 'closed'],
  under_review: ['closed'],
  closed: [],
};

const CHECKLIST_ITEM_STATUSES = ['compliant', 'non_compliant', 'not_applicable'];

module.exports = {
  INCIDENT_TYPES,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  INCIDENT_STATUS_FORWARD_TRANSITIONS,
  CHECKLIST_ITEM_STATUSES,
};
