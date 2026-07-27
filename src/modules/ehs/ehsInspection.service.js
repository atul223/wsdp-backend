const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['inspectionDate', 'scorePct', 'createdAt'];
const EDIT_WINDOW_HOURS = 24;

async function writeAuditLog({ userId, action, referenceId, ipAddress, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, module: 'ehs', referenceId, ipAddress, oldValue, newValue },
    });
  } catch (err) {
    logger.error(`Failed to write audit log: ${err.message}`);
  }
}

function toApiShape(inspection) {
  return {
    id: inspection.id,
    project_id: inspection.projectId,
    inspection_date: inspection.inspectionDate.toISOString().slice(0, 10),
    score_pct: inspection.scorePct !== null && inspection.scorePct !== undefined ? Number(inspection.scorePct) : null,
    remarks: inspection.remarks || null,
    inspected_by: inspection.inspectedBy,
    checklist_items: (inspection.checklistItems || []).map((item) => ({
      id: item.id,
      item_description: item.itemDescription,
      status: item.status,
      due_date: item.dueDate ? item.dueDate.toISOString().slice(0, 10) : null,
    })),
    created_at: inspection.createdAt,
    updated_at: inspection.updatedAt,
  };
}

async function listByProject(projectId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'inspectionDate',
  });

  const where = { projectId };

  const [rows, total] = await Promise.all([
    prisma.ehsInspection.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { checklistItems: true },
    }),
    prisma.ehsInspection.count({ where }),
  ]);

  return { data: rows.map(toApiShape), meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const inspection = await prisma.ehsInspection.findUnique({
    where: { id },
    include: { checklistItems: true },
  });
  if (!inspection) throw AppError.notFound('EHS inspection not found');
  return toApiShape(inspection);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  const inspection = await prisma.ehsInspection.create({
    data: {
      projectId,
      inspectionDate: new Date(payload.inspection_date),
      scorePct: payload.score_pct ?? null,
      remarks: payload.remarks || null,
      inspectedBy: userId,
      checklistItems: payload.checklist_items
        ? {
            create: payload.checklist_items.map((item) => ({
              itemDescription: item.item_description,
              status: item.status,
              dueDate: item.due_date ? new Date(item.due_date) : null,
            })),
          }
        : undefined,
    },
    include: { checklistItems: true },
  });

  await writeAuditLog({ userId, action: 'create', referenceId: inspection.id, ipAddress, newValue: inspection });

  return toApiShape(inspection);
}

function assertCanEdit(inspection, userId, userRole) {
  if (['admin', 'project_manager'].includes(userRole)) return;

  if (inspection.inspectedBy !== userId) {
    throw AppError.forbidden('You can only edit inspections you conducted.');
  }

  const ageHours = (Date.now() - new Date(inspection.createdAt).getTime()) / (1000 * 60 * 60);
  if (ageHours > EDIT_WINDOW_HOURS) {
    throw AppError.forbidden(
      `This inspection can no longer be edited by its author (${EDIT_WINDOW_HOURS}h correction window has passed). Ask a Project Manager or Admin to amend it.`
    );
  }
}

/**
 * Full update replaces top-level inspection fields AND the checklist item
 * set (delete-then-recreate, inside a transaction) — matches PUT's
 * full-replace semantics.
 */
async function fullUpdate({ id, payload, userId, userRole, ipAddress }) {
  const existing = await prisma.ehsInspection.findUnique({
    where: { id },
    include: { checklistItems: true },
  });
  if (!existing) throw AppError.notFound('EHS inspection not found');

  assertCanEdit(existing, userId, userRole);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.ehsChecklistItem.deleteMany({ where: { inspectionId: id } });

    return tx.ehsInspection.update({
      where: { id },
      data: {
        inspectionDate: new Date(payload.inspection_date),
        scorePct: payload.score_pct ?? null,
        remarks: payload.remarks || null,
        checklistItems: payload.checklist_items
          ? {
              create: payload.checklist_items.map((item) => ({
                itemDescription: item.item_description,
                status: item.status,
                dueDate: item.due_date ? new Date(item.due_date) : null,
              })),
            }
          : undefined,
      },
      include: { checklistItems: true },
    });
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

/** Partial update touches only top-level fields (score_pct, remarks) —
 * checklist items are managed individually via the checklist-item endpoint. */
async function partialUpdate({ id, payload, userId, userRole, ipAddress }) {
  const existing = await prisma.ehsInspection.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('EHS inspection not found');

  assertCanEdit(existing, userId, userRole);

  const data = {};
  if (payload.score_pct !== undefined) data.scorePct = payload.score_pct;
  if (payload.remarks !== undefined) data.remarks = payload.remarks;

  const updated = await prisma.ehsInspection.update({
    where: { id },
    data,
    include: { checklistItems: true },
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

/** Deleting an inspection is Admin/Project Manager only (checked at the
 * route level) and cascades to its checklist items. */
async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.ehsInspection.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('EHS inspection not found');

  await prisma.ehsInspection.delete({ where: { id } });

  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

/** Updates a single checklist item (e.g., marking remediation complete)
 * without touching the rest of the inspection. */
async function updateChecklistItem({ itemId, payload, userId, userRole, ipAddress }) {
  const item = await prisma.ehsChecklistItem.findUnique({ where: { id: itemId } });
  if (!item) throw AppError.notFound('Checklist item not found');

  const inspection = await prisma.ehsInspection.findUnique({ where: { id: item.inspectionId } });
  assertCanEdit(inspection, userId, userRole);

  const data = {};
  if (payload.status !== undefined) data.status = payload.status;
  if (payload.due_date !== undefined) data.dueDate = payload.due_date ? new Date(payload.due_date) : null;

  const updated = await prisma.ehsChecklistItem.update({ where: { id: itemId }, data });

  await writeAuditLog({
    userId,
    action: 'update',
    referenceId: itemId,
    ipAddress,
    oldValue: item,
    newValue: updated,
  });

  return {
    id: updated.id,
    inspection_id: updated.inspectionId,
    item_description: updated.itemDescription,
    status: updated.status,
    due_date: updated.dueDate ? updated.dueDate.toISOString().slice(0, 10) : null,
  };
}

async function getProjectIdForInspection(inspectionId) {
  const inspection = await prisma.ehsInspection.findUnique({
    where: { id: inspectionId },
    select: { projectId: true },
  });
  return inspection ? inspection.projectId : null;
}

async function getProjectIdForChecklistItem(itemId) {
  const item = await prisma.ehsChecklistItem.findUnique({
    where: { id: itemId },
    select: { inspection: { select: { projectId: true } } },
  });
  return item ? item.inspection.projectId : null;
}

module.exports = {
  listByProject,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  updateChecklistItem,
  getProjectIdForInspection,
  getProjectIdForChecklistItem,
};
