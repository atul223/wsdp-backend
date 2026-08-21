/* ============================================================
   ehsSummaryItem.factory.js
   ------------------------------------------------------------
   Shared service factory for the two "Type / Count / Details /
   Status" registers on the EHS Dashboard: Incidents and
   Non-Conformities. They are 100% identical in shape (this is
   exactly what replaced the old single hardcoded
   "Incidents & Non-Conformities (May 2026)" table — split into
   two independently CRUD-able tables), so the CRUD logic lives
   here once and ehsIncidentSummary.service.js /
   ehsNonConformitySummary.service.js each just bind it to their
   own Prisma model.
   ============================================================ */
const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');

function toApiShape(row) {
  return {
    id: row.id,
    project_id: row.projectId,
    type: row.type,
    count: row.count,
    details: row.details,
    status: row.status,
    sort_order: row.sortOrder,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/**
 * @param {string} modelName - Prisma delegate name, e.g. 'ehsIncidentSummaryItem'
 * @param {string} auditModule - value written to audit_logs.module
 */
function createSummaryItemService(modelName, auditModule) {
  const model = prisma[modelName];

  async function writeAuditLog({ userId, action, referenceId, ipAddress, oldValue, newValue }) {
    try {
      await prisma.auditLog.create({
        data: { userId, action, module: auditModule, referenceId, ipAddress, oldValue, newValue },
      });
    } catch (err) {
      logger.error(`Failed to write audit log: ${err.message}`);
    }
  }

  async function listByProject(projectId) {
    const rows = await model.findMany({
      where: { projectId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toApiShape);
  }

  async function getById(id) {
    const row = await model.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw AppError.notFound('Item not found');
    return toApiShape(row);
  }

  async function create({ projectId, payload, userId, ipAddress }) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw AppError.notFound('Project not found');

    const row = await model.create({
      data: {
        projectId,
        type: payload.type,
        count: payload.count ?? 0,
        details: payload.details || null,
        status: payload.status,
        sortOrder: payload.sort_order ?? 0,
      },
    });

    await writeAuditLog({ userId, action: 'create', referenceId: row.id, ipAddress, newValue: row });
    return toApiShape(row);
  }

  async function fullUpdate({ id, payload, userId, ipAddress }) {
    const existing = await model.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw AppError.notFound('Item not found');

    const updated = await model.update({
      where: { id },
      data: {
        type: payload.type,
        count: payload.count,
        details: payload.details || null,
        status: payload.status,
        sortOrder: payload.sort_order ?? existing.sortOrder,
      },
    });

    await writeAuditLog({ userId, action: 'update', referenceId: id, ipAddress, oldValue: existing, newValue: updated });
    return toApiShape(updated);
  }

  async function partialUpdate({ id, payload, userId, ipAddress }) {
    const existing = await model.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw AppError.notFound('Item not found');

    const data = {};
    if (payload.type !== undefined) data.type = payload.type;
    if (payload.count !== undefined) data.count = payload.count;
    if (payload.details !== undefined) data.details = payload.details;
    if (payload.status !== undefined) data.status = payload.status;
    if (payload.sort_order !== undefined) data.sortOrder = payload.sort_order;

    const updated = await model.update({ where: { id }, data });

    await writeAuditLog({ userId, action: 'update', referenceId: id, ipAddress, oldValue: existing, newValue: updated });
    return toApiShape(updated);
  }

  // Soft delete — keeps the row available in audit history, consistent
  // with the deletedAt convention used across every other module table.
  async function remove({ id, userId, ipAddress }) {
    const existing = await model.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw AppError.notFound('Item not found');

    await model.update({ where: { id }, data: { deletedAt: new Date() } });
    await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
  }

  async function getProjectIdForItem(id) {
    const row = await model.findUnique({ where: { id }, select: { projectId: true } });
    return row ? row.projectId : null;
  }

  return {
    listByProject,
    getById,
    create,
    fullUpdate,
    partialUpdate,
    remove,
    getProjectIdForItem,
  };
}

module.exports = { createSummaryItemService };
