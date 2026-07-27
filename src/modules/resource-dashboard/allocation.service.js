const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');
const resourceService = require('./resource.service');

const ALLOWED_SORT_FIELDS = ['allocationDate', 'quantity', 'createdAt'];
const TERMINAL_STATUSES = ['completed', 'cancelled'];
const OVERRIDE_ROLES = ['admin', 'project_manager'];

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

function toApiShape(a) {
  return {
    id: a.id,
    resource_id: a.resourceId,
    work_package_id: a.workPackageId || null,
    quantity: Number(a.quantity),
    allocation_date: a.allocationDate.toISOString().slice(0, 10),
    status: a.status,
    remarks: a.remarks || null,
    allocated_by: a.allocatedBy,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

async function assertCapacityNotExceeded({ resourceId, quantity, excludeAllocationId = null }) {
  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, deletedAt: null },
  });

  if (!resource) throw AppError.notFound('Resource not found');

  const allocated = await resourceService.getAllocatedQuantity(resourceId, excludeAllocationId);
  const projectedTotal = allocated + Number(quantity);

  if (projectedTotal > Number(resource.totalCapacity)) {
    throw AppError.conflict(
      `This allocation would bring total commitments to ${projectedTotal.toFixed(2)}, exceeding the resource's total_capacity of ${Number(resource.totalCapacity).toFixed(2)}. Currently committed: ${allocated.toFixed(2)}.`,
      'CAPACITY_EXCEEDED'
    );
  }

  return resource;
}

async function assertWorkPackageBelongsToProject(workPackageId, projectId) {
  const wp = await prisma.workPackage.findFirst({
    where: { id: workPackageId, deletedAt: null },
  });

  if (!wp) throw AppError.notFound('Work package not found');

  if (wp.projectId !== projectId) {
    throw AppError.unprocessable('work_package_id does not belong to the same project as this resource.');
  }
}

function assertCanEdit(allocation, userRole) {
  if (allocation.status === 'completed' && !OVERRIDE_ROLES.includes(userRole)) {
    throw AppError.forbidden('This allocation is marked completed and is final. Only an Admin or Project Manager may amend it.');
  }
}

function assertValidStatusTransition(currentStatus, newStatus, userRole) {
  if (newStatus === undefined || newStatus === currentStatus) return;

  if (TERMINAL_STATUSES.includes(currentStatus) && !OVERRIDE_ROLES.includes(userRole)) {
    throw AppError.forbidden(
      `Allocation status "${currentStatus}" is final. Only an Admin or Project Manager may change it further.`
    );
  }
}

async function listByResource(resourceId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'allocationDate',
  });

  const where = { resourceId };
  if (req.query.status) where.status = req.query.status;

  const [rows, total] = await Promise.all([
    prisma.allocation.findMany({ where, orderBy, skip, take: limit }),
    prisma.allocation.count({ where }),
  ]);

  return {
    data: rows.map(toApiShape),
    meta: buildMeta({ page, limit, total }),
  };
}

async function getById(id) {
  const allocation = await prisma.allocation.findUnique({ where: { id } });
  if (!allocation) throw AppError.notFound('Allocation not found');
  return toApiShape(allocation);
}

async function create({ resourceId, payload, userId, ipAddress }) {
  const resource = await assertCapacityNotExceeded({
    resourceId,
    quantity: payload.quantity,
  });

  if (payload.work_package_id) {
    await assertWorkPackageBelongsToProject(payload.work_package_id, resource.projectId);
  }

  let allocation;

  try {
    allocation = await prisma.allocation.create({
      data: {
        resourceId,
        workPackageId: payload.work_package_id || null,
        quantity: payload.quantity,
        allocationDate: new Date(payload.allocation_date),
        remarks: payload.remarks || null,
        allocatedBy: userId,
        status: 'planned',
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        'An allocation already exists for this resource, work package, and date.',
        'DUPLICATE_ALLOCATION'
      );
    }

    throw err;
  }

  await writeAuditLog({
    userId,
    action: 'create',
    referenceId: allocation.id,
    ipAddress,
    newValue: allocation,
  });

  return toApiShape(allocation);
}

async function fullUpdate({ id, payload, userId, userRole, ipAddress }) {
  const existing = await prisma.allocation.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Allocation not found');

  assertCanEdit(existing, userRole);

  const resource = await assertCapacityNotExceeded({
    resourceId: existing.resourceId,
    quantity: payload.quantity,
    excludeAllocationId: id,
  });

  if (payload.work_package_id) {
    await assertWorkPackageBelongsToProject(payload.work_package_id, resource.projectId);
  }

  let updated;

  try {
    updated = await prisma.allocation.update({
      where: { id },
      data: {
        workPackageId: payload.work_package_id || null,
        quantity: payload.quantity,
        allocationDate: new Date(payload.allocation_date),
        remarks: payload.remarks || null,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        'Another allocation already exists for this resource, work package, and date.',
        'DUPLICATE_ALLOCATION'
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
  const existing = await prisma.allocation.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Allocation not found');

  assertCanEdit(existing, userRole);
  assertValidStatusTransition(existing.status, payload.status, userRole);

  if (payload.quantity !== undefined) {
    await assertCapacityNotExceeded({
      resourceId: existing.resourceId,
      quantity: payload.quantity,
      excludeAllocationId: id,
    });
  }

  if (payload.work_package_id !== undefined && payload.work_package_id !== null) {
    const resource = await prisma.resource.findUnique({
      where: { id: existing.resourceId },
    });

    if (!resource) throw AppError.notFound('Resource not found');

    await assertWorkPackageBelongsToProject(payload.work_package_id, resource.projectId);
  }

  const data = {};

  if (payload.work_package_id !== undefined) data.workPackageId = payload.work_package_id;
  if (payload.quantity !== undefined) data.quantity = payload.quantity;
  if (payload.allocation_date !== undefined) data.allocationDate = new Date(payload.allocation_date);
  if (payload.remarks !== undefined) data.remarks = payload.remarks || null;
  if (payload.status !== undefined) data.status = payload.status;

  const updated = await prisma.allocation.update({
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
  const existing = await prisma.allocation.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Allocation not found');

  if (existing.status === 'completed') {
    throw AppError.conflict(
      'A completed allocation cannot be deleted. Change its status instead if it was recorded in error.',
      'ALLOCATION_COMPLETED_CANNOT_DELETE'
    );
  }

  await prisma.allocation.delete({ where: { id } });

  await writeAuditLog({
    userId,
    action: 'delete',
    referenceId: id,
    ipAddress,
    oldValue: existing,
  });
}

async function getProjectIdForAllocation(allocationId) {
  const allocation = await prisma.allocation.findUnique({
    where: { id: allocationId },
    select: {
      resource: {
        select: {
          projectId: true,
        },
      },
    },
  });

  return allocation ? allocation.resource.projectId : null;
}

module.exports = {
  listByResource,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForAllocation,
};