const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');

/**
 * The 4 editable KPI/summary cards on the Resource Dashboard. Each card
 * behaves like HomeSummaryCard / EhsComplianceSummary elsewhere in this
 * schema: a missing row (or a null valueOverride) means "keep
 * auto-calculating this card from live Resource/Allocation data" — the
 * exact same math the frontend used to do purely client-side. Setting an
 * override lets a user manually pin the displayed number/note; deleting
 * the override (DELETE endpoint) reverts the card back to auto mode.
 */
const CARD_DEFS = [
  { key: 'materials_below_reorder', label: 'Materials Below Reorder' },
  { key: 'equipment_utilization', label: 'Equipment Utilization' },
  { key: 'manpower_deployed', label: 'Manpower Deployed' },
  { key: 'idle_maintenance', label: 'Idle / Maintenance' },
];

async function writeAuditLog({ userId, action, referenceId, ipAddress, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        module: 'resource_dashboard',
        referenceId,
        ipAddress,
        oldValue,
        newValue,
      },
    });
  } catch (err) {
    logger.error(`Failed to write audit log: ${err.message}`);
  }
}

function assertValidCardKey(cardKey) {
  if (!CARD_DEFS.find((c) => c.key === cardKey)) {
    throw AppError.badRequest(`Unknown summary card key: ${cardKey}`);
  }
}

/** Mirrors the frontend's previous computeKPIs() logic exactly, so the
 * "auto" value returned by the API always matches what would have been
 * shown before any override existed. */
async function computeAutoValues(projectId) {
  const resources = await prisma.resource.findMany({ where: { projectId, deletedAt: null } });

  const materials = resources.filter((r) => r.type === 'material');
  const equipment = resources.filter((r) => r.type === 'equipment');
  const manpower = resources.filter((r) => r.type === 'manpower');

  const resourceIds = resources.map((r) => r.id);

  const allocations = resourceIds.length
    ? await prisma.allocation.findMany({
        where: { resourceId: { in: resourceIds }, status: { in: ['planned', 'in_use', 'completed'] } },
      })
    : [];

  const allocatedByResource = {};
  allocations.forEach((a) => {
    allocatedByResource[a.resourceId] = (allocatedByResource[a.resourceId] || 0) + Number(a.quantity);
  });

  const materialsBelowReorder = materials.filter((r) => {
    const total = Number(r.totalCapacity);
    const allocated = allocatedByResource[r.id] || 0;
    const remaining = total - allocated;
    return remaining <= total * 0.25;
  }).length;

  const equipmentCapacity = equipment.reduce((sum, r) => sum + Number(r.totalCapacity), 0);
  const equipmentAllocated = equipment.reduce((sum, r) => sum + (allocatedByResource[r.id] || 0), 0);
  const equipmentUtilization = equipmentCapacity > 0 ? Math.round((equipmentAllocated / equipmentCapacity) * 100) : 0;

  const manpowerDeployed = manpower.reduce((sum, r) => sum + Number(r.totalCapacity), 0);

  const idleOrMaintenance = equipment.reduce((sum, r) => {
    const total = Number(r.totalCapacity);
    const allocated = allocatedByResource[r.id] || 0;
    return sum + (total - allocated);
  }, 0);

  return {
    materials_below_reorder: materialsBelowReorder,
    equipment_utilization: equipmentUtilization,
    manpower_deployed: manpowerDeployed,
    idle_maintenance: idleOrMaintenance,
  };
}

function toApiShape(cardDef, row, autoValue) {
  const hasOverride = !!row && row.valueOverride !== null && row.valueOverride !== undefined;

  return {
    id: row ? row.id : null,
    project_id: row ? row.projectId : undefined,
    card_key: cardDef.key,
    label: cardDef.label,
    auto_value: autoValue,
    value_override: hasOverride ? Number(row.valueOverride) : null,
    note_override: row && row.noteOverride ? row.noteOverride : null,
    // `effective_value` / `effective_note` are what the UI should render:
    // the manual override when present, otherwise the auto-calculated value.
    effective_value: hasOverride ? Number(row.valueOverride) : autoValue,
    effective_note: row && row.noteOverride ? row.noteOverride : null,
    is_manual: hasOverride,
    updated_by: row ? row.updatedBy : null,
    updated_at: row ? row.updatedAt : null,
  };
}

async function listByProject(projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  const [rows, autoValues] = await Promise.all([
    prisma.resourceSummaryCard.findMany({ where: { projectId } }),
    computeAutoValues(projectId),
  ]);

  const rowsByKey = {};
  rows.forEach((r) => {
    rowsByKey[r.cardKey] = r;
  });

  return CARD_DEFS.map((def) => toApiShape(def, rowsByKey[def.key], autoValues[def.key]));
}

async function upsert({ projectId, cardKey, payload, userId, ipAddress }) {
  assertValidCardKey(cardKey);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  const existing = await prisma.resourceSummaryCard.findUnique({
    where: { projectId_cardKey: { projectId, cardKey } },
  });

  const data = {
    valueOverride: payload.value_override !== undefined ? payload.value_override : existing?.valueOverride ?? null,
    noteOverride: payload.note_override !== undefined ? payload.note_override : existing?.noteOverride ?? null,
    updatedBy: userId,
  };

  const row = await prisma.resourceSummaryCard.upsert({
    where: { projectId_cardKey: { projectId, cardKey } },
    create: { projectId, cardKey, ...data },
    update: data,
  });

  await writeAuditLog({
    userId,
    action: existing ? 'update' : 'create',
    referenceId: row.id,
    ipAddress,
    oldValue: existing || null,
    newValue: row,
  });

  const autoValues = await computeAutoValues(projectId);
  const def = CARD_DEFS.find((c) => c.key === cardKey);
  return toApiShape(def, row, autoValues[cardKey]);
}

async function resetToAuto({ projectId, cardKey, userId, ipAddress }) {
  assertValidCardKey(cardKey);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  const existing = await prisma.resourceSummaryCard.findUnique({
    where: { projectId_cardKey: { projectId, cardKey } },
  });

  if (existing) {
    await prisma.resourceSummaryCard.delete({ where: { id: existing.id } });
    await writeAuditLog({ userId, action: 'delete', referenceId: existing.id, ipAddress, oldValue: existing });
  }

  const autoValues = await computeAutoValues(projectId);
  const def = CARD_DEFS.find((c) => c.key === cardKey);
  return toApiShape(def, null, autoValues[cardKey]);
}

module.exports = {
  CARD_DEFS,
  listByProject,
  upsert,
  resetToAuto,
};
