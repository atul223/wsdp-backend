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

function toApiShape(ncr) {
  return {
    id: ncr.id,
    project_id: ncr.projectId,
    description: ncr.description,
    owner: ncr.owner,
    status: ncr.status,
    sort_order: ncr.sortOrder,
    created_at: ncr.createdAt,
    updated_at: ncr.updatedAt,
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
    prisma.nonConformity.findMany({ where, orderBy, skip, take: limit }),
    prisma.nonConformity.count({ where }),
  ]);

  return {
    data: rows.map(toApiShape),
    meta: buildMeta({ page, limit, total }),
  };
}

async function getById(id) {
  const ncr = await prisma.nonConformity.findFirst({ where: { id, deletedAt: null } });

  if (!ncr) throw AppError.notFound('Non-conformity record not found');

  return toApiShape(ncr);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) throw AppError.notFound('Project not found');

  const count = await prisma.nonConformity.count({ where: { projectId, deletedAt: null } });

  const ncr = await prisma.nonConformity.create({
    data: {
      projectId,
      description: payload.description,
      owner: payload.owner,
      status: payload.status || 'open',
      sortOrder: count,
    },
  });

  await writeAuditLog({ userId, action: 'create', referenceId: ncr.id, ipAddress, newValue: ncr });

  return toApiShape(ncr);
}

async function update({ id, payload, userId, ipAddress }) {
  const existing = await prisma.nonConformity.findFirst({ where: { id, deletedAt: null } });

  if (!existing) throw AppError.notFound('Non-conformity record not found');

  const data = {};

  if (payload.description !== undefined) data.description = payload.description;
  if (payload.owner !== undefined) data.owner = payload.owner;
  if (payload.status !== undefined) data.status = payload.status;

  const updated = await prisma.nonConformity.update({ where: { id }, data });

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
  const existing = await prisma.nonConformity.findFirst({ where: { id, deletedAt: null } });

  if (!existing) throw AppError.notFound('Non-conformity record not found');

  await prisma.nonConformity.update({ where: { id }, data: { deletedAt: new Date() } });

  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

module.exports = { listByProject, getById, create, update, remove };
