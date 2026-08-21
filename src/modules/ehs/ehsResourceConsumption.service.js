const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');

async function writeAuditLog({ userId, action, referenceId, ipAddress, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, module: 'ehs_resource_consumption', referenceId, ipAddress, oldValue, newValue },
    });
  } catch (err) {
    logger.error(`Failed to write audit log: ${err.message}`);
  }
}

function computeTrendPct(previousValue, currentValue) {
  const prev = Number(previousValue);
  const curr = Number(currentValue);
  if (!prev) return null;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

function toApiShape(row) {
  return {
    id: row.id,
    project_id: row.projectId,
    resource_name: row.resourceName,
    unit: row.unit,
    previous_period_label: row.previousPeriodLabel,
    previous_value: Number(row.previousValue),
    current_period_label: row.currentPeriodLabel,
    current_value: Number(row.currentValue),
    trend_pct: computeTrendPct(row.previousValue, row.currentValue),
    sort_order: row.sortOrder,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

async function listByProject(projectId) {
  const rows = await prisma.ehsResourceConsumption.findMany({
    where: { projectId, deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return rows.map(toApiShape);
}

async function getById(id) {
  const row = await prisma.ehsResourceConsumption.findFirst({ where: { id, deletedAt: null } });
  if (!row) throw AppError.notFound('Resource consumption row not found');
  return toApiShape(row);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  const row = await prisma.ehsResourceConsumption.create({
    data: {
      projectId,
      resourceName: payload.resource_name,
      unit: payload.unit || null,
      previousPeriodLabel: payload.previous_period_label,
      previousValue: payload.previous_value,
      currentPeriodLabel: payload.current_period_label,
      currentValue: payload.current_value,
      sortOrder: payload.sort_order ?? 0,
    },
  });

  await writeAuditLog({ userId, action: 'create', referenceId: row.id, ipAddress, newValue: row });
  return toApiShape(row);
}

async function fullUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.ehsResourceConsumption.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Resource consumption row not found');

  const updated = await prisma.ehsResourceConsumption.update({
    where: { id },
    data: {
      resourceName: payload.resource_name,
      unit: payload.unit || null,
      previousPeriodLabel: payload.previous_period_label,
      previousValue: payload.previous_value,
      currentPeriodLabel: payload.current_period_label,
      currentValue: payload.current_value,
      sortOrder: payload.sort_order ?? existing.sortOrder,
    },
  });

  await writeAuditLog({ userId, action: 'update', referenceId: id, ipAddress, oldValue: existing, newValue: updated });
  return toApiShape(updated);
}

async function partialUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.ehsResourceConsumption.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Resource consumption row not found');

  const data = {};
  if (payload.resource_name !== undefined) data.resourceName = payload.resource_name;
  if (payload.unit !== undefined) data.unit = payload.unit;
  if (payload.previous_period_label !== undefined) data.previousPeriodLabel = payload.previous_period_label;
  if (payload.previous_value !== undefined) data.previousValue = payload.previous_value;
  if (payload.current_period_label !== undefined) data.currentPeriodLabel = payload.current_period_label;
  if (payload.current_value !== undefined) data.currentValue = payload.current_value;
  if (payload.sort_order !== undefined) data.sortOrder = payload.sort_order;

  const updated = await prisma.ehsResourceConsumption.update({ where: { id }, data });

  await writeAuditLog({ userId, action: 'update', referenceId: id, ipAddress, oldValue: existing, newValue: updated });
  return toApiShape(updated);
}

async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.ehsResourceConsumption.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Resource consumption row not found');

  await prisma.ehsResourceConsumption.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

async function getProjectIdForItem(id) {
  const row = await prisma.ehsResourceConsumption.findUnique({ where: { id }, select: { projectId: true } });
  return row ? row.projectId : null;
}

module.exports = { listByProject, getById, create, fullUpdate, partialUpdate, remove, getProjectIdForItem };
