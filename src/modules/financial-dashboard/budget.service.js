const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['fiscalYear', 'category', 'allocatedAmount', 'createdAt'];

// Invoice statuses that count against a budget's allocation. 'rejected'
// invoices are excluded — they never consumed the budget.
const ACTIVE_INVOICE_STATUSES = ['pending', 'approved', 'paid'];

async function writeAuditLog({ userId, action, referenceId, ipAddress, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        module: 'financial_dashboard',
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

function toApiShape(budget, utilizedAmount) {
  const allocated = Number(budget.allocatedAmount);
  return {
    id: budget.id,
    project_id: budget.projectId,
    category: budget.category,
    fiscal_year: budget.fiscalYear,
    allocated_amount: allocated,
    currency: budget.currency,
    notes: budget.notes || null,
    ...(utilizedAmount !== undefined
      ? {
          utilized_amount: utilizedAmount,
          remaining_amount: Number((allocated - utilizedAmount).toFixed(2)),
        }
      : {}),
    created_at: budget.createdAt,
    updated_at: budget.updatedAt,
  };
}

async function getUtilizedAmount(budgetId, excludeInvoiceId = null) {
  const result = await prisma.invoice.aggregate({
    where: {
      budgetId,
      status: { in: ACTIVE_INVOICE_STATUSES },
      ...(excludeInvoiceId ? { id: { not: excludeInvoiceId } } : {}),
    },
    _sum: { amount: true },
  });
  return Number(result._sum.amount || 0);
}

/**
 * Business rule: when reducing a budget's allocated_amount, the new
 * amount must still cover all active (pending/approved/paid) invoices
 * already booked against it.
 */
async function assertAllocationCoversCommitments(budgetId, newAllocatedAmount) {
  const utilized = await getUtilizedAmount(budgetId);
  if (newAllocatedAmount < utilized) {
    throw AppError.conflict(
      `allocated_amount (${newAllocatedAmount}) cannot be less than the ${utilized} already committed to active invoices under this budget.`,
      'ALLOCATION_BELOW_COMMITTED'
    );
  }
}

async function listByProject(projectId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'fiscalYear',
  });

  const where = { projectId, deletedAt: null };

  const [rows, total] = await Promise.all([
    prisma.budget.findMany({ where, orderBy, skip, take: limit }),
    prisma.budget.count({ where }),
  ]);

  const data = await Promise.all(
    rows.map(async (b) => toApiShape(b, await getUtilizedAmount(b.id)))
  );

  return { data, meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const budget = await prisma.budget.findFirst({ where: { id, deletedAt: null } });
  if (!budget) throw AppError.notFound('Budget not found');
  const utilized = await getUtilizedAmount(id);
  return toApiShape(budget, utilized);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw AppError.notFound('Project not found');

  let budget;
  try {
    budget = await prisma.budget.create({
      data: {
        projectId,
        category: payload.category,
        fiscalYear: payload.fiscal_year,
        allocatedAmount: payload.allocated_amount,
        currency: payload.currency,
        notes: payload.notes || null,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        `A budget line already exists for category "${payload.category}" in fiscal year ${payload.fiscal_year}.`,
        'DUPLICATE_BUDGET_LINE'
      );
    }
    throw err;
  }

  await writeAuditLog({ userId, action: 'create', referenceId: budget.id, ipAddress, newValue: budget });

  return toApiShape(budget, 0);
}

async function fullUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.budget.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Budget not found');

  await assertAllocationCoversCommitments(id, payload.allocated_amount);

  let updated;
  try {
    updated = await prisma.budget.update({
      where: { id },
      data: {
        category: payload.category,
        fiscalYear: payload.fiscal_year,
        allocatedAmount: payload.allocated_amount,
        currency: payload.currency,
        notes: payload.notes || null,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        `A budget line already exists for category "${payload.category}" in fiscal year ${payload.fiscal_year}.`,
        'DUPLICATE_BUDGET_LINE'
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

  return toApiShape(updated, await getUtilizedAmount(id));
}

async function partialUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.budget.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Budget not found');

  if (payload.allocated_amount !== undefined) {
    await assertAllocationCoversCommitments(id, payload.allocated_amount);
  }

  const data = {};
  if (payload.category !== undefined) data.category = payload.category;
  if (payload.fiscal_year !== undefined) data.fiscalYear = payload.fiscal_year;
  if (payload.allocated_amount !== undefined) data.allocatedAmount = payload.allocated_amount;
  if (payload.currency !== undefined) data.currency = payload.currency;
  if (payload.notes !== undefined) data.notes = payload.notes;

  let updated;
  try {
    updated = await prisma.budget.update({ where: { id }, data });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        'A budget line already exists for this category and fiscal year.',
        'DUPLICATE_BUDGET_LINE'
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

  return toApiShape(updated, await getUtilizedAmount(id));
}

/**
 * Business rule: a budget with existing invoices cannot be deleted — the
 * API rejects with 409 so historical financial records are never
 * silently orphaned. Only budgets with zero invoices can be soft-deleted.
 */
async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.budget.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw AppError.notFound('Budget not found');

  const invoiceCount = await prisma.invoice.count({ where: { budgetId: id } });

  if (invoiceCount > 0) {
    throw AppError.conflict(
      `This budget has ${invoiceCount} invoice(s) and cannot be deleted.`,
      'BUDGET_HAS_INVOICES'
    );
  }

  await prisma.budget.update({ where: { id }, data: { deletedAt: new Date() } });

  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

/** Resolves the parent projectId for a budget — used by project-scope middleware. */
async function getProjectIdForBudget(budgetId) {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    select: { projectId: true },
  });
  return budget ? budget.projectId : null;
}

module.exports = {
  listByProject,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForBudget,
  getUtilizedAmount,
};
