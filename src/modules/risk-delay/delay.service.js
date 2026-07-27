const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['daysDelayed', 'createdAt', 'updatedAt'];
const EDIT_WINDOW_HOURS = 24;
const DELAY_ROOT_CAUSE_THRESHOLD_DAYS = 10;

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

function toApiShape(delay) {
  return {
    id: delay.id,
    project_id: delay.projectId,
    work_package_id: delay.workPackageId,
    reason: delay.reason,
    category: delay.category,
    days_delayed: delay.daysDelayed,
    root_cause: delay.rootCause || null,
    mitigation_plan: delay.mitigationPlan || null,
    status: delay.status,
    reported_by: delay.reportedBy,
    created_at: delay.createdAt,
    updated_at: delay.updatedAt,
  };
}

async function assertWorkPackageBelongsToProject(workPackageId, projectId) {
  if (!workPackageId) return;

  const wp = await prisma.workPackage.findFirst({
    where: {
      id: workPackageId,
      deletedAt: null,
    },
  });

  if (!wp) throw AppError.notFound('Referenced work package not found');

  if (wp.projectId !== projectId) {
    throw AppError.unprocessable('The referenced work package does not belong to this project.');
  }
}

async function listByProject(projectId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'createdAt',
  });

  const where = { projectId };

  if (req.query.work_package_id) where.workPackageId = req.query.work_package_id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.category) where.category = req.query.category;

  const [rows, total] = await Promise.all([
    prisma.delay.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.delay.count({ where }),
  ]);

  return {
    data: rows.map(toApiShape),
    meta: buildMeta({ page, limit, total }),
  };
}

async function getById(id) {
  const delay = await prisma.delay.findUnique({ where: { id } });

  if (!delay) throw AppError.notFound('Delay record not found');

  return toApiShape(delay);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) throw AppError.notFound('Project not found');

  await assertWorkPackageBelongsToProject(payload.work_package_id, projectId);

  const delay = await prisma.delay.create({
    data: {
      projectId,
      workPackageId: payload.work_package_id || null,
      reason: payload.reason,
      category: payload.category || 'general',
      daysDelayed: payload.days_delayed,
      rootCause: payload.root_cause || null,
      mitigationPlan: payload.mitigation_plan || null,
      status: payload.status || 'open',
      reportedBy: userId,
    },
  });

  await writeAuditLog({
    userId,
    action: 'create',
    referenceId: delay.id,
    ipAddress,
    newValue: delay,
  });

  return toApiShape(delay);
}

function assertCanEdit(delay, userId, userRole) {
  if (['admin', 'project_manager'].includes(userRole)) return;

  if (delay.reportedBy !== userId) {
    throw AppError.forbidden('You can only edit delay records you reported.');
  }

  const ageHours = (Date.now() - new Date(delay.createdAt).getTime()) / (1000 * 60 * 60);

  if (ageHours > EDIT_WINDOW_HOURS) {
    throw AppError.forbidden(
      `This delay record can no longer be edited by its reporter (${EDIT_WINDOW_HOURS}h correction window has passed). Ask a Project Manager or Admin to amend it.`
    );
  }
}

function assertRootCauseIfNeeded(daysDelayed, rootCause) {
  if (daysDelayed > DELAY_ROOT_CAUSE_THRESHOLD_DAYS && !rootCause) {
    throw AppError.unprocessable(
      `root_cause is required when days_delayed exceeds ${DELAY_ROOT_CAUSE_THRESHOLD_DAYS} days`
    );
  }
}

async function fullUpdate({ id, payload, userId, userRole, ipAddress }) {
  const existing = await prisma.delay.findUnique({ where: { id } });

  if (!existing) throw AppError.notFound('Delay record not found');

  assertCanEdit(existing, userId, userRole);
  await assertWorkPackageBelongsToProject(payload.work_package_id, existing.projectId);
  assertRootCauseIfNeeded(payload.days_delayed, payload.root_cause);

  const updated = await prisma.delay.update({
    where: { id },
    data: {
      workPackageId: payload.work_package_id || null,
      reason: payload.reason,
      category: payload.category || existing.category,
      daysDelayed: payload.days_delayed,
      rootCause: payload.root_cause || null,
      mitigationPlan: payload.mitigation_plan || null,
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
  const existing = await prisma.delay.findUnique({ where: { id } });

  if (!existing) throw AppError.notFound('Delay record not found');

  assertCanEdit(existing, userId, userRole);

  if (payload.work_package_id !== undefined) {
    await assertWorkPackageBelongsToProject(payload.work_package_id, existing.projectId);
  }

  const effectiveDays =
    payload.days_delayed !== undefined ? payload.days_delayed : existing.daysDelayed;

  const effectiveRootCause =
    payload.root_cause !== undefined ? payload.root_cause : existing.rootCause;

  assertRootCauseIfNeeded(effectiveDays, effectiveRootCause);

  const data = {};

  if (payload.work_package_id !== undefined) data.workPackageId = payload.work_package_id;
  if (payload.reason !== undefined) data.reason = payload.reason;
  if (payload.category !== undefined) data.category = payload.category;
  if (payload.days_delayed !== undefined) data.daysDelayed = payload.days_delayed;
  if (payload.root_cause !== undefined) data.rootCause = payload.root_cause;
  if (payload.mitigation_plan !== undefined) data.mitigationPlan = payload.mitigation_plan;
  if (payload.status !== undefined) data.status = payload.status;

  const updated = await prisma.delay.update({
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
  const existing = await prisma.delay.findUnique({ where: { id } });

  if (!existing) throw AppError.notFound('Delay record not found');

  await prisma.delay.delete({ where: { id } });

  await writeAuditLog({
    userId,
    action: 'delete',
    referenceId: id,
    ipAddress,
    oldValue: existing,
  });
}

async function getProjectIdForDelay(delayId) {
  const delay = await prisma.delay.findUnique({
    where: { id: delayId },
    select: { projectId: true },
  });

  return delay ? delay.projectId : null;
}

module.exports = {
  listByProject,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForDelay,
};