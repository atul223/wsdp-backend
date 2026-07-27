const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['name', 'type', 'totalCapacity', 'createdAt'];

// Allocation statuses that count against a resource's capacity.
// 'cancelled' is excluded — it never consumed the resource.
const ACTIVE_ALLOCATION_STATUSES = ['planned', 'in_use', 'completed'];

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

function toApiShape(resource, allocatedQuantity) {
  const total = Number(resource.totalCapacity);
  return {
    id: resource.id,
    project_id: resource.projectId,
    name: resource.name,
    type: resource.type,
    unit: resource.unit,
    total_capacity: total,
    notes: resource.notes || null,
    ...(allocatedQuantity !== undefined
      ? {
          allocated_quantity: allocatedQuantity,
          remaining_capacity: Number((total - allocatedQuantity).toFixed(2)),
        }
      : {}),
    created_at: resource.createdAt,
    updated_at: resource.updatedAt,
  };
}

async function getAllocatedQuantity(resourceId, excludeAllocationId = null) {
  const result = await prisma.allocation.aggregate({
    where: {
      resourceId,
      status: { in: ACTIVE_ALLOCATION_STATUSES },
      ...(excludeAllocationId ? { id: { not: excludeAllocationId } } : {}),
    },
    _sum: { quantity: true },
  });
  return Number(result._sum.quantity || 0);
}

/**
 * Business rule: when reducing a resource's total_capacity, the new
 * amount must still cover all active (planned/in_use/completed)
 * allocations already booked against it.
 */
async function assertCapacityCoversCommitments(resourceId, newTotalCapacity) {
  const allocated = await getAllocatedQuantity(resourceId);
  if (newTotalCapacity < allocated) {
    throw AppError.conflict(
      `total_capacity (${newTotalCapacity}) cannot be less than the ${allocated} already committed to active allocations for this resource.`,
      'CAPACITY_BELOW_COMMITTED'
    );
  }
}

async function listByProject(projectId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'name',
  });

  const where = { projectId, deletedAt: null };
  if (req.query.type) where.type = req.query.type;

  const [rows, total] = await Promise.all([
    prisma.resource.findMany({ where, orderBy, skip, take: limit }),
    prisma.resource.count({ where }),
  ]);

  const data = await Promise.all(
    rows.map(async (r) => toApiShape(r, await getAllocatedQuantity(r.id)))
  );

  return { data, meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const resource = await prisma.resource.findFirst({ where: { id, deletedAt: null } });
  if (!resource) throw AppError.notFound('Resource not found');
  const allocated = await getAllocatedQuantity(id);
  return toApiShape(resource, allocated);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  let resource;
  try {
    resource = await prisma.resource.create({
      data: {
        projectId,
        name: payload.name,
        type: payload.type,
        unit: payload.unit,
        totalCapacity: payload.total_capacity,
        notes: payload.notes || null,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        `A resource named "${payload.name}" already exists for this project.`,
        'DUPLICATE_RESOURCE'
      );
    }
    throw err;
  }

  await writeAuditLog({ userId, action: 'create', referenceId: resource.id, ipAddress, newValue: resource });

  return toApiShape(resource, 0);
}

async function fullUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.resource.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Resource not found');

  await assertCapacityCoversCommitments(id, payload.total_capacity);

  let updated;
  try {
    updated = await prisma.resource.update({
      where: { id },
      data: {
        name: payload.name,
        type: payload.type,
        unit: payload.unit,
        totalCapacity: payload.total_capacity,
        notes: payload.notes || null,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        `A resource named "${payload.name}" already exists for this project.`,
        'DUPLICATE_RESOURCE'
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

  return toApiShape(updated, await getAllocatedQuantity(id));
}

async function partialUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.resource.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Resource not found');

  if (payload.total_capacity !== undefined) {
    await assertCapacityCoversCommitments(id, payload.total_capacity);
  }

  const data = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.type !== undefined) data.type = payload.type;
  if (payload.unit !== undefined) data.unit = payload.unit;
  if (payload.total_capacity !== undefined) data.totalCapacity = payload.total_capacity;
  if (payload.notes !== undefined) data.notes = payload.notes;

  let updated;
  try {
    updated = await prisma.resource.update({ where: { id }, data });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        'A resource with this name already exists for this project.',
        'DUPLICATE_RESOURCE'
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

  return toApiShape(updated, await getAllocatedQuantity(id));
}

/**
 * Business rule: a resource with existing allocations cannot be deleted —
 * the API rejects with 409 so allocation history is never orphaned. Only
 * resources with zero allocations can be soft-deleted.
 */
async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.resource.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Resource not found');

  const allocationCount = await prisma.allocation.count({ where: { resourceId: id } });

  if (allocationCount > 0) {
    throw AppError.conflict(
      `This resource has ${allocationCount} allocation(s) and cannot be deleted.`,
      'RESOURCE_HAS_ALLOCATIONS'
    );
  }

  await prisma.resource.update({ where: { id }, data: { deletedAt: new Date() } });

  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

/** Resolves the parent projectId for a resource — used by project-scope middleware. */
async function getProjectIdForResource(resourceId) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { projectId: true },
  });
  return resource ? resource.projectId : null;
}

module.exports = {
  listByProject,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForResource,
  getAllocatedQuantity,
};
