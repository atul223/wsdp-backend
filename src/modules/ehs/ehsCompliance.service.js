const prisma = require('../../config/db');
const logger = require('../../common/utils/logger');

async function writeAuditLog({ userId, action, referenceId, ipAddress, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, module: 'ehs', referenceId, ipAddress, oldValue, newValue },
    });
  } catch (err) {
    logger.error(`Failed to write audit log: ${err.message}`);
  }
}

function toApiShape(summary, autoOpenIncidents, autoToolboxTalks) {
  return {
    project_id: summary?.projectId,
    overall_eshs_pct: summary?.overallEshsPct !== undefined && summary?.overallEshsPct !== null
      ? Number(summary.overallEshsPct)
      : null,
    pgas_esmp_pct: summary?.pgasEsmpPct !== undefined && summary?.pgasEsmpPct !== null
      ? Number(summary.pgasEsmpPct)
      : null,
    health_safety_plan_pct: summary?.healthSafetyPlanPct !== undefined && summary?.healthSafetyPlanPct !== null
      ? Number(summary.healthSafetyPlanPct)
      : null,
    site_management_plan_pct: summary?.siteManagementPlanPct !== undefined && summary?.siteManagementPlanPct !== null
      ? Number(summary.siteManagementPlanPct)
      : null,
    method_statements_pct: summary?.methodStatementsPct !== undefined && summary?.methodStatementsPct !== null
      ? Number(summary.methodStatementsPct)
      : null,
    // Open Incidents & Toolbox Talks (30D) auto-calculate unless an
    // explicit override is stored — same "null = auto" pattern as
    // RiskDelaySummary in the risk-delay module.
    open_incidents: summary?.openIncidentsOverride ?? autoOpenIncidents,
    open_incidents_is_override: summary?.openIncidentsOverride !== null && summary?.openIncidentsOverride !== undefined,
    open_incidents_note: summary?.openIncidentsNote || null,
    toolbox_talks_30d: summary?.toolboxTalks30dOverride ?? autoToolboxTalks,
    toolbox_talks_30d_is_override:
      summary?.toolboxTalks30dOverride !== null && summary?.toolboxTalks30dOverride !== undefined,
    toolbox_talks_30d_note: summary?.toolboxTalks30dNote || null,
    updated_at: summary?.updatedAt || null,
  };
}

async function computeAutoOpenIncidents(projectId) {
  return prisma.ehsIncident.count({ where: { projectId, status: 'open' } });
}

// Toolbox talks aren't tracked as a dedicated table yet; default the
// auto-calculated value to 0 so the card never silently shows stale data
// when no override has been set. Once a toolbox-talk log table exists,
// swap this out for a real count(date >= now-30d) query.
async function computeAutoToolboxTalks(_projectId) {
  return 0;
}

async function getByProject(projectId) {
  const [summary, autoOpenIncidents, autoToolboxTalks] = await Promise.all([
    prisma.ehsComplianceSummary.findUnique({ where: { projectId } }),
    computeAutoOpenIncidents(projectId),
    computeAutoToolboxTalks(projectId),
  ]);

  return toApiShape(summary || { projectId }, autoOpenIncidents, autoToolboxTalks);
}

/** Upserts the single per-project compliance summary row. Any field left
 * out of the payload is untouched; passing null for open_incidents_override
 * / toolbox_talks_30d_override reverts that card back to auto-calculating. */
async function patch({ projectId, payload, userId, ipAddress }) {
  const existing = await prisma.ehsComplianceSummary.findUnique({ where: { projectId } });

  const data = {};
  if (payload.overall_eshs_pct !== undefined) data.overallEshsPct = payload.overall_eshs_pct;
  if (payload.pgas_esmp_pct !== undefined) data.pgasEsmpPct = payload.pgas_esmp_pct;
  if (payload.health_safety_plan_pct !== undefined) data.healthSafetyPlanPct = payload.health_safety_plan_pct;
  if (payload.site_management_plan_pct !== undefined) data.siteManagementPlanPct = payload.site_management_plan_pct;
  if (payload.method_statements_pct !== undefined) data.methodStatementsPct = payload.method_statements_pct;
  if (payload.open_incidents_override !== undefined) data.openIncidentsOverride = payload.open_incidents_override;
  if (payload.open_incidents_note !== undefined) data.openIncidentsNote = payload.open_incidents_note;
  if (payload.toolbox_talks_30d_override !== undefined) data.toolboxTalks30dOverride = payload.toolbox_talks_30d_override;
  if (payload.toolbox_talks_30d_note !== undefined) data.toolboxTalks30dNote = payload.toolbox_talks_30d_note;
  data.updatedBy = userId;

  const updated = await prisma.ehsComplianceSummary.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await writeAuditLog({
    userId,
    action: existing ? 'update' : 'create',
    referenceId: updated.id,
    ipAddress,
    oldValue: existing,
    newValue: updated,
  });

  const [autoOpenIncidents, autoToolboxTalks] = await Promise.all([
    computeAutoOpenIncidents(projectId),
    computeAutoToolboxTalks(projectId),
  ]);

  return toApiShape(updated, autoOpenIncidents, autoToolboxTalks);
}

module.exports = { getByProject, patch };
