const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['sortOrder', 'groupName', 'createdAt'];

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
  return {
    id: row.id,
    project_id: row.projectId,
    group_name: row.groupName || '',
    category: row.category || '',
    headcount: row.headcount,
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
    prisma.workforceEmployer.findMany({ where, orderBy, skip, take: limit }),
    prisma.workforceEmployer.count({ where }),
  ]);

  return { data: rows.map(toApiShape), meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const row = await prisma.workforceEmployer.findFirst({ where: { id, deletedAt: null } });
  if (!row) throw AppError.notFound('Workforce record not found');
  return toApiShape(row);
}

async function getNextSortOrder(projectId) {
  const last = await prisma.workforceEmployer.findFirst({
    where: { projectId, deletedAt: null },
    orderBy: { sortOrder: 'desc' },
  });
  return last ? last.sortOrder + 1 : 0;
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  const sortOrder = payload.sort_order !== undefined ? payload.sort_order : await getNextSortOrder(projectId);

  const row = await prisma.workforceEmployer.create({
    data: {
      projectId,
      groupName: payload.group_name || null,
      category: payload.category || null,
      headcount: payload.headcount,
      isTotal: payload.is_total || false,
      sortOrder,
    },
  });

  await writeAuditLog({ userId, action: 'create', referenceId: row.id, ipAddress, newValue: row });
  return toApiShape(row);
}

async function fullUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.workforceEmployer.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Workforce record not found');

  const updated = await prisma.workforceEmployer.update({
    where: { id },
    data: {
      groupName: payload.group_name || null,
      category: payload.category || null,
      headcount: payload.headcount,
      isTotal: payload.is_total || false,
      ...(payload.sort_order !== undefined ? { sortOrder: payload.sort_order } : {}),
    },
  });

  await writeAuditLog({ userId, action: 'update', referenceId: id, ipAddress, oldValue: existing, newValue: updated });
  return toApiShape(updated);
}

async function partialUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.workforceEmployer.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Workforce record not found');

  const data = {};
  if (payload.group_name !== undefined) data.groupName = payload.group_name;
  if (payload.category !== undefined) data.category = payload.category;
  if (payload.headcount !== undefined) data.headcount = payload.headcount;
  if (payload.is_total !== undefined) data.isTotal = payload.is_total;
  if (payload.sort_order !== undefined) data.sortOrder = payload.sort_order;

  const updated = await prisma.workforceEmployer.update({ where: { id }, data });

  await writeAuditLog({ userId, action: 'update', referenceId: id, ipAddress, oldValue: existing, newValue: updated });
  return toApiShape(updated);
}

async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.workforceEmployer.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Workforce record not found');

  await prisma.workforceEmployer.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

async function getProjectIdForRecord(id) {
  const row = await prisma.workforceEmployer.findUnique({ where: { id }, select: { projectId: true } });
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
