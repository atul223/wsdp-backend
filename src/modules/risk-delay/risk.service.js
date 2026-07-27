const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['identifiedDate', 'probability', 'impact', 'status', 'createdAt'];
const EDIT_WINDOW_HOURS = 24;

const RISK_STATUS_FORWARD_TRANSITIONS = {
  open: ['mitigated', 'closed'],
  mitigated: ['closed'],
  closed: [],
};

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

function toApiShape(risk) {
  return {
    id: risk.id,
    project_id: risk.projectId,
    category: risk.category,
    description: risk.description,
    probability: risk.probability,
    impact: risk.impact,
    status: risk.status,
    owner_id: risk.ownerId,
    owner_name: risk.ownerName || null,
    identified_date: risk.identifiedDate.toISOString().slice(0, 10),
    created_at: risk.createdAt,
    updated_at: risk.updatedAt,
  };
}

async function listByProject(projectId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'identifiedDate',
  });

  const where = { projectId };

  if (req.query.status) where.status = req.query.status;
  if (req.query.probability) where.probability = req.query.probability;
  if (req.query.impact) where.impact = req.query.impact;
  if (req.query.category) where.category = req.query.category;

  const [rows, total] = await Promise.all([
    prisma.risk.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.risk.count({ where }),
  ]);

  return {
    data: rows.map(toApiShape),
    meta: buildMeta({ page, limit, total }),
  };
}

async function getById(id) {
  const risk = await prisma.risk.findUnique({ where: { id } });

  if (!risk) throw AppError.notFound('Risk not found');

  return toApiShape(risk);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) throw AppError.notFound('Project not found');

  const risk = await prisma.risk.create({
    data: {
      projectId,
      category: payload.category,
      description: payload.description,
      probability: payload.probability,
      impact: payload.impact,
      status: payload.status || 'open',
      ownerId: payload.owner_id || userId,
      ownerName: payload.owner_name || null,
      identifiedDate: new Date(payload.identified_date),
    },
  });

  await writeAuditLog({
    userId,
    action: 'create',
    referenceId: risk.id,
    ipAddress,
    newValue: risk,
  });

  return toApiShape(risk);
}

function assertCanEdit(risk, userId, userRole) {
  if (['admin', 'project_manager'].includes(userRole)) return;

  if (risk.ownerId !== userId) {
    throw AppError.forbidden('You can only edit risks you own.');
  }

  const ageHours = (Date.now() - new Date(risk.createdAt).getTime()) / (1000 * 60 * 60);

  if (ageHours > EDIT_WINDOW_HOURS) {
    throw AppError.forbidden(
      `This risk can no longer be edited by its owner (${EDIT_WINDOW_HOURS}h correction window has passed). Ask a Project Manager or Admin to amend it.`
    );
  }
}

function assertValidStatusTransition(currentStatus, nextStatus, userRole) {
  if (!nextStatus || nextStatus === currentStatus) return;
  if (userRole === 'admin') return;

  const allowedNext = RISK_STATUS_FORWARD_TRANSITIONS[currentStatus] || [];

  if (!allowedNext.includes(nextStatus)) {
    throw AppError.unprocessable(
      `Cannot move status from '${currentStatus}' to '${nextStatus}'. Only forward transitions (${allowedNext.join(', ') || 'none'}) are allowed without Admin approval.`
    );
  }
}

async function fullUpdate({ id, payload, userId, userRole, ipAddress }) {
  const existing = await prisma.risk.findUnique({ where: { id } });

  if (!existing) throw AppError.notFound('Risk not found');

  assertCanEdit(existing, userId, userRole);
  assertValidStatusTransition(existing.status, payload.status, userRole);

  const updated = await prisma.risk.update({
    where: { id },
    data: {
      category: payload.category,
      description: payload.description,
      probability: payload.probability,
      impact: payload.impact,
      ownerId: payload.owner_id || existing.ownerId,
      ownerName: payload.owner_name !== undefined ? payload.owner_name : existing.ownerName,
      identifiedDate: new Date(payload.identified_date),
      status: payload.status || existing.status,
    },
  });

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

async function partialUpdate({ id, payload, userId, userRole, ipAddress }) {
  const existing = await prisma.risk.findUnique({ where: { id } });

  if (!existing) throw AppError.notFound('Risk not found');

  assertCanEdit(existing, userId, userRole);
  assertValidStatusTransition(existing.status, payload.status, userRole);

  const data = {};

  if (payload.category !== undefined) data.category = payload.category;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.probability !== undefined) data.probability = payload.probability;
  if (payload.impact !== undefined) data.impact = payload.impact;
  if (payload.owner_id !== undefined) data.ownerId = payload.owner_id;
  if (payload.owner_name !== undefined) data.ownerName = payload.owner_name;
  if (payload.identified_date !== undefined) data.identifiedDate = new Date(payload.identified_date);
  if (payload.status !== undefined) data.status = payload.status;

  const updated = await prisma.risk.update({
    where: { id },
    data,
  });

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
  const existing = await prisma.risk.findUnique({ where: { id } });

  if (!existing) throw AppError.notFound('Risk not found');

  if (existing.status !== 'open') {
    throw AppError.conflict(
      `This risk is '${existing.status}' and is part of the permanent risk register history. Close it instead of deleting it.`,
      'RISK_NOT_DELETABLE'
    );
  }

  await prisma.risk.delete({ where: { id } });

  await writeAuditLog({
    userId,
    action: 'delete',
    referenceId: id,
    ipAddress,
    oldValue: existing,
  });
}

async function getProjectIdForRisk(riskId) {
  const risk = await prisma.risk.findUnique({
    where: { id: riskId },
    select: { projectId: true },
  });

  return risk ? risk.projectId : null;
}

module.exports = {
  listByProject,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForRisk,
};