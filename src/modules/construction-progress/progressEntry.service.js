const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['reportedDate', 'createdAt', 'physicalProgressPct'];
const EDIT_WINDOW_HOURS = 24;
const DATE_RANGE_GRACE_DAYS = 30;

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

function toApiShape(entry) {
  return {
    id: entry.id,
    work_package_id: entry.workPackageId,
    reported_date: entry.reportedDate.toISOString().slice(0, 10),
    physical_progress_pct: Number(entry.physicalProgressPct),
    remarks: entry.remarks || null,
    attachment_ids: entry.attachmentIds || [],
    reported_by: entry.reportedBy,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };
}

function daysBetween(a, b) {
  return Math.abs((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Business rule: reported_date must be within planned_start/planned_end
 * (+/- a 30-day grace window). Admins may override with force=true.
 */
function assertDateWithinWorkPackageRange(workPackage, reportedDate, force) {
  if (force) return;

  const reported = new Date(reportedDate);
  const start = new Date(workPackage.plannedStart);
  const end = new Date(workPackage.plannedEnd);

  const beforeStart = reported < start && daysBetween(reported, start) > DATE_RANGE_GRACE_DAYS;
  const afterEnd = reported > end && daysBetween(reported, end) > DATE_RANGE_GRACE_DAYS;

  if (beforeStart || afterEnd) {
    throw AppError.unprocessable(
      `reported_date (${reportedDate}) is more than ${DATE_RANGE_GRACE_DAYS} days outside the work package's planned window (${workPackage.plannedStart.toISOString().slice(0, 10)} to ${workPackage.plannedEnd.toISOString().slice(0, 10)}). Pass force=true (Admin only) to override.`
    );
  }
}

/**
 * Business rule: physical_progress_pct cannot decrease relative to the
 * most recent prior entry for the same work package, unless the actor
 * is Project Manager or Admin.
 */
async function assertProgressNotDecreasing({ workPackageId, newPct, userRole, excludeEntryId = null }) {
  if (['admin', 'project_manager'].includes(userRole)) return;

  const latest = await prisma.progressEntry.findFirst({
    where: { workPackageId, ...(excludeEntryId ? { id: { not: excludeEntryId } } : {}) },
    orderBy: { reportedDate: 'desc' },
  });

  if (latest && Number(newPct) < Number(latest.physicalProgressPct)) {
    throw AppError.unprocessable(
      `Progress cannot decrease from ${latest.physicalProgressPct}% to ${newPct}% without Project Manager or Admin approval.`
    );
  }
}

async function listByWorkPackage(workPackageId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'reportedDate',
  });

  const where = { workPackageId };

  if (req.query.date_from || req.query.date_to) {
    where.reportedDate = {};
    if (req.query.date_from) where.reportedDate.gte = new Date(req.query.date_from);
    if (req.query.date_to) where.reportedDate.lte = new Date(req.query.date_to);
  }

  const [rows, total] = await Promise.all([
    prisma.progressEntry.findMany({ where, orderBy, skip, take: limit }),
    prisma.progressEntry.count({ where }),
  ]);

  return { data: rows.map(toApiShape), meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const entry = await prisma.progressEntry.findUnique({ where: { id } });
  if (!entry) throw AppError.notFound('Progress entry not found');
  return toApiShape(entry);
}

async function create({ workPackageId, payload, userId, userRole, ipAddress, force }) {
  const workPackage = await prisma.workPackage.findFirst({
    where: { id: workPackageId, deletedAt: null },
  });
  if (!workPackage) throw AppError.notFound('Work package not found');

  assertDateWithinWorkPackageRange(workPackage, payload.reported_date, force);
  await assertProgressNotDecreasing({
    workPackageId,
    newPct: payload.physical_progress_pct,
    userRole,
  });

  let entry;
  try {
    entry = await prisma.progressEntry.create({
      data: {
        workPackageId,
        reportedDate: new Date(payload.reported_date),
        physicalProgressPct: payload.physical_progress_pct,
        remarks: payload.remarks || null,
        attachmentIds: payload.attachment_ids || [],
        reportedBy: userId,
      },
    });
  } catch (err) {
    // Prisma unique constraint violation -> one entry per work package per day.
    if (err.code === 'P2002') {
      throw AppError.conflict(
        'A progress entry already exists for this work package on this date. Use PATCH to update it instead.',
        'DUPLICATE_PROGRESS_ENTRY'
      );
    }
    throw err;
  }

  await writeAuditLog({ userId, action: 'create', referenceId: entry.id, ipAddress, newValue: entry });

  return toApiShape(entry);
}

/** Confirms the actor is allowed to edit this specific entry (ownership + 24h window, or PM/Admin). */
function assertCanEdit(entry, userId, userRole) {
  if (['admin', 'project_manager'].includes(userRole)) return;

  if (entry.reportedBy !== userId) {
    throw AppError.forbidden('You can only edit progress entries you created.');
  }

  const ageHours = (Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60);
  if (ageHours > EDIT_WINDOW_HOURS) {
    throw AppError.forbidden(
      `This entry can no longer be edited by its creator (${EDIT_WINDOW_HOURS}h correction window has passed). Ask a Project Manager or Admin to amend it.`
    );
  }
}

async function fullUpdate({ id, payload, userId, userRole, ipAddress, force }) {
  const existing = await prisma.progressEntry.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Progress entry not found');

  assertCanEdit(existing, userId, userRole);

  const workPackage = await prisma.workPackage.findUnique({ where: { id: existing.workPackageId } });
  assertDateWithinWorkPackageRange(workPackage, payload.reported_date, force);
  await assertProgressNotDecreasing({
    workPackageId: existing.workPackageId,
    newPct: payload.physical_progress_pct,
    userRole,
    excludeEntryId: id,
  });

  let updated;
  try {
    updated = await prisma.progressEntry.update({
      where: { id },
      data: {
        reportedDate: new Date(payload.reported_date),
        physicalProgressPct: payload.physical_progress_pct,
        remarks: payload.remarks || null,
        attachmentIds: payload.attachment_ids || [],
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        'Another progress entry already exists for this work package on that date.',
        'DUPLICATE_PROGRESS_ENTRY'
      );
    }
    throw err;
  }

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
  const existing = await prisma.progressEntry.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Progress entry not found');

  assertCanEdit(existing, userId, userRole);

  if (payload.physical_progress_pct !== undefined) {
    await assertProgressNotDecreasing({
      workPackageId: existing.workPackageId,
      newPct: payload.physical_progress_pct,
      userRole,
      excludeEntryId: id,
    });
  }

  const data = {};
  if (payload.physical_progress_pct !== undefined) data.physicalProgressPct = payload.physical_progress_pct;
  if (payload.remarks !== undefined) data.remarks = payload.remarks;
  if (payload.attachment_ids !== undefined) data.attachmentIds = payload.attachment_ids;

  const updated = await prisma.progressEntry.update({ where: { id }, data });

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

/** Business rule: deleting a progress entry is restricted to Admin/Project Manager (checked at the route level via requireRole). */
async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.progressEntry.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Progress entry not found');

  await prisma.progressEntry.delete({ where: { id } });

  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

/** Resolves the parent projectId for a progress entry (via its work package) — used by project-scope middleware. */
async function getProjectIdForEntry(entryId) {
  const entry = await prisma.progressEntry.findUnique({
    where: { id: entryId },
    select: { workPackage: { select: { projectId: true } } },
  });
  return entry ? entry.workPackage.projectId : null;
}

module.exports = {
  listByWorkPackage,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForEntry,
};
