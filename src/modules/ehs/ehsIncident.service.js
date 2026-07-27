const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');
const { INCIDENT_STATUS_FORWARD_TRANSITIONS } = require('../../common/constants/ehs');

const ALLOWED_SORT_FIELDS = ['incidentDate', 'severity', 'status', 'createdAt'];
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

function toApiShape(incident) {
  return {
    id: incident.id,
    project_id: incident.projectId,
    incident_type: incident.incidentType,
    severity: incident.severity,
    incident_date: incident.incidentDate.toISOString().slice(0, 10),
    description: incident.description,
    status: incident.status,
    reported_by: incident.reportedBy,
    created_at: incident.createdAt,
    updated_at: incident.updatedAt,
  };
}

async function listByProject(projectId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'incidentDate',
  });

  const where = { projectId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.severity) where.severity = req.query.severity;

  const [rows, total] = await Promise.all([
    prisma.ehsIncident.findMany({ where, orderBy, skip, take: limit }),
    prisma.ehsIncident.count({ where }),
  ]);

  return { data: rows.map(toApiShape), meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const incident = await prisma.ehsIncident.findUnique({ where: { id } });
  if (!incident) throw AppError.notFound('EHS incident not found');
  return toApiShape(incident);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  const incident = await prisma.ehsIncident.create({
    data: {
      projectId,
      incidentType: payload.incident_type,
      severity: payload.severity,
      incidentDate: new Date(payload.incident_date),
      description: payload.description,
      status: 'open',
      reportedBy: userId,
    },
  });

  await writeAuditLog({ userId, action: 'create', referenceId: incident.id, ipAddress, newValue: incident });

  return toApiShape(incident);
}

/** Confirms the actor may edit this incident: PM/Admin always can; the
 * original reporter can only within the 24h correction window. */
function assertCanEdit(incident, userId, userRole) {
  if (['admin', 'project_manager'].includes(userRole)) return;

  if (incident.reportedBy !== userId) {
    throw AppError.forbidden('You can only edit incidents you reported.');
  }

  const ageHours = (Date.now() - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60);
  if (ageHours > EDIT_WINDOW_HOURS) {
    throw AppError.forbidden(
      `This incident can no longer be edited by its reporter (${EDIT_WINDOW_HOURS}h correction window has passed). Ask a Project Manager or Admin to amend it.`
    );
  }
}

/** Business rule: status can only move forward (open -> under_review -> closed)
 * unless the actor is Admin, who may move it backward (e.g., reopen a closed incident). */
function assertValidStatusTransition(currentStatus, nextStatus, userRole) {
  if (!nextStatus || nextStatus === currentStatus) return;
  if (userRole === 'admin') return;

  const allowedNext = INCIDENT_STATUS_FORWARD_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    throw AppError.unprocessable(
      `Cannot move status from '${currentStatus}' to '${nextStatus}'. Only forward transitions (${allowedNext.join(', ') || 'none'}) are allowed without Admin approval.`
    );
  }
}

async function fullUpdate({ id, payload, userId, userRole, ipAddress }) {
  const existing = await prisma.ehsIncident.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('EHS incident not found');

  assertCanEdit(existing, userId, userRole);
  assertValidStatusTransition(existing.status, payload.status, userRole);

  const updated = await prisma.ehsIncident.update({
    where: { id },
    data: {
      incidentType: payload.incident_type,
      severity: payload.severity,
      incidentDate: new Date(payload.incident_date),
      description: payload.description,
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
  const existing = await prisma.ehsIncident.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('EHS incident not found');

  assertCanEdit(existing, userId, userRole);
  assertValidStatusTransition(existing.status, payload.status, userRole);

  const data = {};
  if (payload.incident_type !== undefined) data.incidentType = payload.incident_type;
  if (payload.severity !== undefined) data.severity = payload.severity;
  if (payload.incident_date !== undefined) data.incidentDate = new Date(payload.incident_date);
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.status !== undefined) data.status = payload.status;

  const updated = await prisma.ehsIncident.update({ where: { id }, data });

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

/** Business rule: an incident can only be deleted (mis-entry correction)
 * while it's still 'open'. Anything under review or closed is part of
 * the permanent safety record and must be closed, not deleted. */
async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.ehsIncident.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('EHS incident not found');

  if (existing.status !== 'open') {
    throw AppError.conflict(
      `This incident is '${existing.status}' and is part of the permanent safety record. It cannot be deleted — close it instead if resolved.`,
      'INCIDENT_NOT_DELETABLE'
    );
  }

  await prisma.ehsIncident.delete({ where: { id } });

  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

async function getProjectIdForIncident(incidentId) {
  const incident = await prisma.ehsIncident.findUnique({
    where: { id: incidentId },
    select: { projectId: true },
  });
  return incident ? incident.projectId : null;
}

module.exports = {
  listByProject,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForIncident,
};
