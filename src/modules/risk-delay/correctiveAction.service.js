const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['sortOrder', 'status', 'createdAt', 'updatedAt'];

async function writeAuditLog({ userId, action, referenceId, ipAddress, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        module: 'risk_delay',
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

function toApiShape(item) {
  return {
    id: item.id,
    project_id: item.projectId,
    action: item.action,
    owner: item.owner,
    status: item.status,
    sort_order: item.sortOrder,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

async function listByProject(projectId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'sortOrder',
  });

  const where = { projectId, deletedAt: null };

  if (req.query.status) where.status = req.query.status;

  const [rows, total] = await Promise.all([
    prisma.correctiveAction.findMany({ where, orderBy, skip, take: limit }),
    prisma.correctiveAction.count({ where }),
  ]);

  return {
    data: rows.map(toApiShape),
    meta: buildMeta({ page, limit, total }),
  };
}

async function getById(id) {
  const item = await prisma.correctiveAction.findFirst({ where: { id, deletedAt: null } });

  if (!item) throw AppError.notFound('Corrective action not found');

  return toApiShape(item);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) throw AppError.notFound('Project not found');

  const count = await prisma.correctiveAction.count({ where: { projectId, deletedAt: null } });

  const item = await prisma.correctiveAction.create({
    data: {
      projectId,
      action: payload.action,
      owner: payload.owner,
      status: payload.status || 'pending',
      sortOrder: count,
    },
  });

  await writeAuditLog({ userId, action: 'create', referenceId: item.id, ipAddress, newValue: item });

  return toApiShape(item);
}

async function update({ id, payload, userId, ipAddress }) {
  const existing = await prisma.correctiveAction.findFirst({ where: { id, deletedAt: null } });

  if (!existing) throw AppError.notFound('Corrective action not found');

  const data = {};

  if (payload.action !== undefined) data.action = payload.action;
  if (payload.owner !== undefined) data.owner = payload.owner;
  if (payload.status !== undefined) data.status = payload.status;

  const updated = await prisma.correctiveAction.update({ where: { id }, data });

  await writeAuditLog({
    userId,
    action: 'update',
    referenceId: id,
    ipAddress,
    oldValue: existing,
    newValue: updated,
  });

  return toApiShape(updated);
}

async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.correctiveAction.findFirst({ where: { id, deletedAt: null } });

  if (!existing) throw AppError.notFound('Corrective action not found');

  await prisma.correctiveAction.update({ where: { id }, data: { deletedAt: new Date() } });

  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

module.exports = { listByProject, getById, create, update, remove };
