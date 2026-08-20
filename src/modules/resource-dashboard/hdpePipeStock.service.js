const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['sortOrder', 'diameter', 'createdAt'];

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

/** Cover status is derived the same way material "status" is: based on
 * remaining stock as a proportion of what was received. */
function getCoverStatus(received, stock) {
  const totalNum = Number(received);
  const stockNum = Number(stock);

  if (stockNum <= 0) return 'Re-order';
  if (stockNum <= totalNum * 0.25) return 'Watch';
  return 'OK';
}

function toApiShape(row) {
  const received = Number(row.receivedM);
  const used = Number(row.usedM);
  const stock = Number((received - used).toFixed(2));

  return {
    id: row.id,
    project_id: row.projectId,
    diameter: row.diameter,
    received_m: received,
    used_m: used,
    stock_m: stock,
    cover: getCoverStatus(received, stock),
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
    prisma.hdpePipeStock.findMany({ where, orderBy, skip, take: limit }),
    prisma.hdpePipeStock.count({ where }),
  ]);

  return { data: rows.map(toApiShape), meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const row = await prisma.hdpePipeStock.findFirst({ where: { id, deletedAt: null } });
  if (!row) throw AppError.notFound('HDPE pipe stock record not found');
  return toApiShape(row);
}

async function getNextSortOrder(projectId) {
  const last = await prisma.hdpePipeStock.findFirst({
    where: { projectId, deletedAt: null },
    orderBy: { sortOrder: 'desc' },
  });
  return last ? last.sortOrder + 1 : 0;
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  const sortOrder = payload.sort_order !== undefined ? payload.sort_order : await getNextSortOrder(projectId);

  let row;
  try {
    row = await prisma.hdpePipeStock.create({
      data: {
        projectId,
        diameter: payload.diameter,
        receivedM: payload.received_m,
        usedM: payload.used_m,
        sortOrder,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        `A pipe stock entry for diameter "${payload.diameter}" already exists for this project.`,
        'DUPLICATE_HDPE_DIAMETER'
      );
    }
    throw err;
  }

  await writeAuditLog({ userId, action: 'create', referenceId: row.id, ipAddress, newValue: row });
  return toApiShape(row);
}

async function fullUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.hdpePipeStock.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('HDPE pipe stock record not found');

  let updated;
  try {
    updated = await prisma.hdpePipeStock.update({
      where: { id },
      data: {
        diameter: payload.diameter,
        receivedM: payload.received_m,
        usedM: payload.used_m,
        ...(payload.sort_order !== undefined ? { sortOrder: payload.sort_order } : {}),
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        `A pipe stock entry for diameter "${payload.diameter}" already exists for this project.`,
        'DUPLICATE_HDPE_DIAMETER'
      );
    }
    throw err;
  }

  await writeAuditLog({ userId, action: 'update', referenceId: id, ipAddress, oldValue: existing, newValue: updated });
  return toApiShape(updated);
}

async function partialUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.hdpePipeStock.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('HDPE pipe stock record not found');

  const data = {};
  if (payload.diameter !== undefined) data.diameter = payload.diameter;
  if (payload.received_m !== undefined) data.receivedM = payload.received_m;
  if (payload.used_m !== undefined) data.usedM = payload.used_m;
  if (payload.sort_order !== undefined) data.sortOrder = payload.sort_order;

  let updated;
  try {
    updated = await prisma.hdpePipeStock.update({ where: { id }, data });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict('A pipe stock entry for this diameter already exists for this project.', 'DUPLICATE_HDPE_DIAMETER');
    }
    throw err;
  }

  await writeAuditLog({ userId, action: 'update', referenceId: id, ipAddress, oldValue: existing, newValue: updated });
  return toApiShape(updated);
}

async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.hdpePipeStock.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('HDPE pipe stock record not found');

  await prisma.hdpePipeStock.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

/** Resolves the parent projectId — used by project-scope middleware. */
async function getProjectIdForRecord(id) {
  const row = await prisma.hdpePipeStock.findUnique({ where: { id }, select: { projectId: true } });
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
