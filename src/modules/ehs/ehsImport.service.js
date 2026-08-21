const AppError = require('../../common/errors/AppError');
const incidentSummaryService = require('./ehsIncidentSummary.service');
const nonConformitySummaryService = require('./ehsNonConformitySummary.service');
const resourceConsumptionService = require('./ehsResourceConsumption.service');

// Maps the `table` field in the import payload to the service used to
// create each row, and to a normalizer that maps a raw CSV row object
// (parsed with the exact header names below) into that service's
// expected create payload.
const IMPORT_TARGETS = {
  incident_summary: {
    service: incidentSummaryService,
    headers: ['type', 'count', 'details', 'status'],
    normalize: (row) => ({
      type: row.type,
      count: Number(row.count) || 0,
      details: row.details || '',
      status: row.status,
    }),
  },
  nonconformity_summary: {
    service: nonConformitySummaryService,
    headers: ['type', 'count', 'details', 'status'],
    normalize: (row) => ({
      type: row.type,
      count: Number(row.count) || 0,
      details: row.details || '',
      status: row.status,
    }),
  },
  resource_consumption: {
    service: resourceConsumptionService,
    headers: ['resource_name', 'unit', 'previous_period_label', 'previous_value', 'current_period_label', 'current_value'],
    normalize: (row) => ({
      resource_name: row.resource_name,
      unit: row.unit || '',
      previous_period_label: row.previous_period_label,
      previous_value: Number(row.previous_value),
      current_period_label: row.current_period_label,
      current_value: Number(row.current_value),
    }),
  },
};

/** Bulk-creates rows parsed from an imported CSV. Each row is inserted
 * independently so one bad row doesn't fail the whole batch — the
 * response reports both successes and per-row errors. */
async function importRows({ projectId, table, rows, userId, ipAddress }) {
  const target = IMPORT_TARGETS[table];
  if (!target) {
    throw AppError.unprocessable(
      `Unknown import target '${table}'. Expected one of: ${Object.keys(IMPORT_TARGETS).join(', ')}`
    );
  }

  const results = { created: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i += 1) {
    try {
      const payload = target.normalize(rows[i]);
      await target.service.create({ projectId, payload, userId, ipAddress });
      results.created += 1;
    } catch (err) {
      results.failed += 1;
      results.errors.push({ row: i + 1, message: err.message });
    }
  }

  return results;
}

function getImportTargets() {
  return Object.entries(IMPORT_TARGETS).map(([key, val]) => ({ table: key, expected_headers: val.headers }));
}

module.exports = { importRows, getImportTargets };
