const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['sortOrder', 'category', 'createdAt'];

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

function toApiShape(row) {
  const planned = row.planned !== null && row.planned !== undefined ? Number(row.planned) : null;
  const deployed = Number(row.deployed);
  const variance = planned !== null ? Number((planned - deployed).toFixed(2)) : null;

  return {
    id: row.id,
    project_id: row.projectId,
    category: row.category,
    planned,
    deployed,
    variance,
    remarks: row.remarks || null,
    is_total: row.isTotal,
    sort_order: row.sortOrder,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

async function listByProject(projectId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'sortOrder',
  });

  const where = { projectId, deletedAt: null };

  const [rows, total] = await Promise.all([
    prisma.equipmentDeployment.findMany({ where, orderBy, skip, take: limit }),
    prisma.equipmentDeployment.count({ where }),
  ]);

  return { data: rows.map(toApiShape), meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const row = await prisma.equipmentDeployment.findFirst({ where: { id, deletedAt: null } });
  if (!row) throw AppError.notFound('Equipment deployment record not found');
  return toApiShape(row);
}

async function getNextSortOrder(projectId) {
  const last = await prisma.equipmentDeployment.findFirst({
    where: { projectId, deletedAt: null },
    orderBy: { sortOrder: 'desc' },
  });
  return last ? last.sortOrder + 1 : 0;
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  const sortOrder = payload.sort_order !== undefined ? payload.sort_order : await getNextSortOrder(projectId);

  const row = await prisma.equipmentDeployment.create({
    data: {
      projectId,
      category: payload.category,
      planned: payload.planned ?? null,
      deployed: payload.deployed,
      remarks: payload.remarks || null,
      isTotal: payload.is_total || false,
      sortOrder,
    },
  });

  await writeAuditLog({ userId, action: 'create', referenceId: row.id, ipAddress, newValue: row });
  return toApiShape(row);
}

async function fullUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.equipmentDeployment.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Equipment deployment record not found');

  const updated = await prisma.equipmentDeployment.update({
    where: { id },
    data: {
      category: payload.category,
      planned: payload.planned ?? null,
      deployed: payload.deployed,
      remarks: payload.remarks || null,
      isTotal: payload.is_total || false,
      ...(payload.sort_order !== undefined ? { sortOrder: payload.sort_order } : {}),
    },
  });

  await writeAuditLog({ userId, action: 'update', referenceId: id, ipAddress, oldValue: existing, newValue: updated });
  return toApiShape(updated);
}

async function partialUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.equipmentDeployment.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Equipment deployment record not found');

  const data = {};
  if (payload.category !== undefined) data.category = payload.category;
  if (payload.planned !== undefined) data.planned = payload.planned;
  if (payload.deployed !== undefined) data.deployed = payload.deployed;
  if (payload.remarks !== undefined) data.remarks = payload.remarks;
  if (payload.is_total !== undefined) data.isTotal = payload.is_total;
  if (payload.sort_order !== undefined) data.sortOrder = payload.sort_order;

  const updated = await prisma.equipmentDeployment.update({ where: { id }, data });

  await writeAuditLog({ userId, action: 'update', referenceId: id, ipAddress, oldValue: existing, newValue: updated });
  return toApiShape(updated);
}

async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.equipmentDeployment.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Equipment deployment record not found');

  await prisma.equipmentDeployment.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

async function getProjectIdForRecord(id) {
  const row = await prisma.equipmentDeployment.findUnique({ where: { id }, select: { projectId: true } });
  return row ? row.projectId : null;
}

module.exports = {
  listByProject,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForRecord,
};
