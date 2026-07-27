const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['plannedStart', 'plannedEnd', 'name', 'createdAt'];

async function writeAuditLog({ userId, action, referenceId, ipAddress, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        module: 'construction_progress',
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

function toApiShape(wp, latestProgressPct) {
  return {
    id: wp.id,
    project_id: wp.projectId,
    name: wp.name,
    planned_start: wp.plannedStart.toISOString().slice(0, 10),
    planned_end: wp.plannedEnd.toISOString().slice(0, 10),
    actual_start: wp.actualStart ? wp.actualStart.toISOString().slice(0, 10) : null,
    actual_end: wp.actualEnd ? wp.actualEnd.toISOString().slice(0, 10) : null,
    weightage_pct: Number(wp.weightagePct),
    ...(latestProgressPct !== undefined ? { latest_progress_pct: latestProgressPct } : {}),
    created_at: wp.createdAt,
    updated_at: wp.updatedAt,
  };
}

/**
 * Business rule: sum of weightage_pct across active work packages in a
 * project must not exceed 100. Pass excludeId when updating an existing
 * work package so its own current weightage isn't double-counted.
 */
async function assertWeightageWithinBudget(projectId, incomingWeightage, excludeId = null) {
  const others = await prisma.workPackage.findMany({
    where: {
      projectId,
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { weightagePct: true },
  });

  const existingTotal = others.reduce((sum, wp) => sum + Number(wp.weightagePct), 0);
  const newTotal = existingTotal + Number(incomingWeightage);

  if (newTotal > 100) {
    throw AppError.conflict(
      `Total weightage for this project would be ${newTotal.toFixed(2)}%, exceeding the 100% cap (currently ${existingTotal.toFixed(2)}% allocated).`,
      'WEIGHTAGE_EXCEEDED'
    );
  }
}

/** Business rule: planned_end must fall within the project's window, if the project has an end_date set. */
async function assertWithinProjectWindow(project, plannedStart, plannedEnd) {
  if (project.endDate && new Date(plannedEnd) > new Date(project.endDate)) {
    throw AppError.unprocessable(
      `planned_end (${plannedEnd}) falls after the project's end date (${project.endDate.toISOString().slice(0, 10)})`
    );
  }
  if (project.startDate && new Date(plannedStart) < new Date(project.startDate)) {
    throw AppError.unprocessable(
      `planned_start (${plannedStart}) falls before the project's start date (${project.startDate.toISOString().slice(0, 10)})`
    );
  }
}

async function listByProject(projectId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'plannedStart',
  });

  const where = { projectId, deletedAt: null };

  const [rows, total] = await Promise.all([
    prisma.workPackage.findMany({ where, orderBy, skip, take: limit }),
    prisma.workPackage.count({ where }),
  ]);

  // Latest progress % per work package (N+1 is acceptable at this scale;
  // revisit with a single aggregated query if work-package counts grow large).
  const data = await Promise.all(
    rows.map(async (wp) => {
      const latest = await prisma.progressEntry.findFirst({
        where: { workPackageId: wp.id },
        orderBy: { reportedDate: 'desc' },
        select: { physicalProgressPct: true },
      });
      return toApiShape(wp, latest ? Number(latest.physicalProgressPct) : 0);
    })
  );

  return { data, meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const wp = await prisma.workPackage.findFirst({ where: { id, deletedAt: null } });
  if (!wp) throw AppError.notFound('Work package not found');
  return toApiShape(wp);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  await assertWeightageWithinBudget(projectId, payload.weightage_pct);
  await assertWithinProjectWindow(project, payload.planned_start, payload.planned_end);

  const wp = await prisma.workPackage.create({
    data: {
      projectId,
      name: payload.name,
      plannedStart: new Date(payload.planned_start),
      plannedEnd: new Date(payload.planned_end),
      actualStart: payload.actual_start ? new Date(payload.actual_start) : null,
      actualEnd: payload.actual_end ? new Date(payload.actual_end) : null,
      weightagePct: payload.weightage_pct,
    },
  });

  await writeAuditLog({ userId, action: 'create', referenceId: wp.id, ipAddress, newValue: wp });

  return toApiShape(wp, 0);
}

async function fullUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.workPackage.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Work package not found');

  const project = await prisma.project.findUnique({ where: { id: existing.projectId } });

  await assertWeightageWithinBudget(existing.projectId, payload.weightage_pct, id);
  await assertWithinProjectWindow(project, payload.planned_start, payload.planned_end);

  const updated = await prisma.workPackage.update({
    where: { id },
    data: {
      name: payload.name,
      plannedStart: new Date(payload.planned_start),
      plannedEnd: new Date(payload.planned_end),
      actualStart: payload.actual_start ? new Date(payload.actual_start) : null,
      actualEnd: payload.actual_end ? new Date(payload.actual_end) : null,
      weightagePct: payload.weightage_pct,
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

async function partialUpdate({ id, payload, userRole, userId, ipAddress }) {
  const existing = await prisma.workPackage.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Work package not found');

  // Business rule: only Planning Engineer / Project Manager / Admin may
  // change planning fields (weightage_pct, planned_start, planned_end).
  // Site Engineers may only patch actual_start/actual_end.
  const planningFields = ['weightage_pct', 'planned_start', 'planned_end'];
  const touchesPlanningField = planningFields.some((f) => payload[f] !== undefined);
  const canEditPlanning = ['admin', 'project_manager', 'planning_engineer'].includes(userRole);

  if (touchesPlanningField && !canEditPlanning) {
    throw AppError.forbidden('Only Planning Engineer, Project Manager, or Admin may change planning fields (weightage, planned dates).');
  }

  if (payload.weightage_pct !== undefined) {
    await assertWeightageWithinBudget(existing.projectId, payload.weightage_pct, id);
  }

  if (payload.planned_start !== undefined || payload.planned_end !== undefined) {
    const project = await prisma.project.findUnique({ where: { id: existing.projectId } });
    await assertWithinProjectWindow(
      project,
      payload.planned_start || existing.plannedStart.toISOString().slice(0, 10),
      payload.planned_end || existing.plannedEnd.toISOString().slice(0, 10)
    );
  }

  const data = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.planned_start !== undefined) data.plannedStart = new Date(payload.planned_start);
  if (payload.planned_end !== undefined) data.plannedEnd = new Date(payload.planned_end);
  if (payload.actual_start !== undefined) data.actualStart = payload.actual_start ? new Date(payload.actual_start) : null;
  if (payload.actual_end !== undefined) data.actualEnd = payload.actual_end ? new Date(payload.actual_end) : null;
  if (payload.weightage_pct !== undefined) data.weightagePct = payload.weightage_pct;

  const updated = await prisma.workPackage.update({ where: { id }, data });

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

/**
 * Business rule: a work package with existing progress entries cannot be
 * deleted — the API rejects with 409 and points the caller to soft-delete
 * (deactivate) semantics instead. Only work packages with zero history
 * can be soft-deleted directly.
 */
async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.workPackage.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Work package not found');

  const entryCount = await prisma.progressEntry.count({ where: { workPackageId: id } });

  if (entryCount > 0) {
    throw AppError.conflict(
      `This work package has ${entryCount} progress entries and cannot be deleted. Mark it as inactive instead.`,
      'WORK_PACKAGE_HAS_HISTORY'
    );
  }

  await prisma.workPackage.update({ where: { id }, data: { deletedAt: new Date() } });

  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

/** Resolves the parent projectId for a work package — used by project-scope middleware. */
async function getProjectIdForWorkPackage(workPackageId) {
  const wp = await prisma.workPackage.findUnique({
    where: { id: workPackageId },
    select: { projectId: true },
  });
  return wp ? wp.projectId : null;
}

module.exports = {
  listByProject,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForWorkPackage,
};
