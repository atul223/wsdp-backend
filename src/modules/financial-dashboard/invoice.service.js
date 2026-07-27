const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');
const budgetService = require('./budget.service');

const ALLOWED_SORT_FIELDS = ['invoiceDate', 'dueDate', 'amount', 'createdAt'];
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

function toApiShape(inv) {
  return {
    id: inv.id,
    budget_id: inv.budgetId,
    invoice_number: inv.invoiceNumber,
    vendor_name: inv.vendorName,
    amount: Number(inv.amount),
    invoice_date: inv.invoiceDate.toISOString().slice(0, 10),
    due_date: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : null,
    status: inv.status,
    payment_date: inv.paymentDate ? inv.paymentDate.toISOString().slice(0, 10) : null,
    attachment_ids: inv.attachmentIds || [],
    submitted_by: inv.submittedBy,
    created_at: inv.createdAt,
    updated_at: inv.updatedAt,
  };
}

/**
 * Business rule: the sum of active (pending/approved/paid) invoice
 * amounts under a budget must never exceed the budget's allocated_amount.
 */
async function assertBudgetNotOverAllocated({ budgetId, amount, excludeInvoiceId = null }) {
  const budget = await prisma.budget.findFirst({ where: { id: budgetId, deletedAt: null } });
  if (!budget) throw AppError.notFound('Budget not found');

  const utilized = await budgetService.getUtilizedAmount(budgetId, excludeInvoiceId);
  const projectedTotal = utilized + Number(amount);

  if (projectedTotal > Number(budget.allocatedAmount)) {
    throw AppError.conflict(
      `This invoice would bring total commitments to ${projectedTotal.toFixed(2)}, exceeding the budget's allocated_amount of ${Number(budget.allocatedAmount).toFixed(2)} (currently ${utilized.toFixed(2)} committed).`,
      'BUDGET_EXCEEDED'
    );
  }
}

/**
 * Business rule: once an invoice is marked 'paid' it is financially
 * final — only Admin may still edit or change its status. Any other
 * role attempting to edit a paid invoice is rejected.
 */
function assertCanEdit(invoice, userRole) {
  if (invoice.status === 'paid' && userRole !== 'admin') {
    throw AppError.forbidden('This invoice has been paid and is now final. Only an Admin may amend it.');
  }
}

/**
 * Business rule: status transitions follow pending -> approved -> paid,
 * or pending/approved -> rejected. 'rejected' and 'paid' are terminal
 * states; only Admin may move an invoice out of a terminal state.
 */
function assertValidStatusTransition(currentStatus, newStatus, userRole) {
  if (newStatus === undefined || newStatus === currentStatus) return;

  const terminal = ['paid', 'rejected'];
  if (terminal.includes(currentStatus) && userRole !== 'admin') {
    throw AppError.forbidden(
      `Invoice status "${currentStatus}" is final. Only an Admin may change it further.`
    );
  }
}

async function listByBudget(budgetId, req) {
  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'invoiceDate',
  });

  const where = { budgetId };
  if (req.query.status) where.status = req.query.status;

  const [rows, total] = await Promise.all([
    prisma.invoice.findMany({ where, orderBy, skip, take: limit }),
    prisma.invoice.count({ where }),
  ]);

  return { data: rows.map(toApiShape), meta: buildMeta({ page, limit, total }) };
}

async function getById(id) {
  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv) throw AppError.notFound('Invoice not found');
  return toApiShape(inv);
}

async function create({ budgetId, payload, userId, ipAddress }) {
  await assertBudgetNotOverAllocated({ budgetId, amount: payload.amount });

  let inv;
  try {
    inv = await prisma.invoice.create({
      data: {
        budgetId,
        invoiceNumber: payload.invoice_number,
        vendorName: payload.vendor_name,
        amount: payload.amount,
        invoiceDate: new Date(payload.invoice_date),
        dueDate: payload.due_date ? new Date(payload.due_date) : null,
        attachmentIds: payload.attachment_ids || [],
        submittedBy: userId,
        status: 'pending',
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        `Invoice number "${payload.invoice_number}" already exists for this budget.`,
        'DUPLICATE_INVOICE_NUMBER'
      );
    }
    throw err;
  }

  await writeAuditLog({ userId, action: 'create', referenceId: inv.id, ipAddress, newValue: inv });

  return toApiShape(inv);
}

async function fullUpdate({ id, payload, userId, userRole, ipAddress }) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Invoice not found');

  assertCanEdit(existing, userRole);
  await assertBudgetNotOverAllocated({ budgetId: existing.budgetId, amount: payload.amount, excludeInvoiceId: id });

  let updated;
  try {
    updated = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber: payload.invoice_number,
        vendorName: payload.vendor_name,
        amount: payload.amount,
        invoiceDate: new Date(payload.invoice_date),
        dueDate: payload.due_date ? new Date(payload.due_date) : null,
        attachmentIds: payload.attachment_ids || [],
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw AppError.conflict(
        `Invoice number "${payload.invoice_number}" already exists for this budget.`,
        'DUPLICATE_INVOICE_NUMBER'
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
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Invoice not found');

  assertCanEdit(existing, userRole);
  assertValidStatusTransition(existing.status, payload.status, userRole);

  if (payload.amount !== undefined) {
    await assertBudgetNotOverAllocated({ budgetId: existing.budgetId, amount: payload.amount, excludeInvoiceId: id });
  }

  const data = {};
  if (payload.vendor_name !== undefined) data.vendorName = payload.vendor_name;
  if (payload.amount !== undefined) data.amount = payload.amount;
  if (payload.invoice_date !== undefined) data.invoiceDate = new Date(payload.invoice_date);
  if (payload.due_date !== undefined) data.dueDate = payload.due_date ? new Date(payload.due_date) : null;
  if (payload.attachment_ids !== undefined) data.attachmentIds = payload.attachment_ids;
  if (payload.status !== undefined) {
    data.status = payload.status;
    // Business rule: moving to 'paid' stamps payment_date automatically.
    if (payload.status === 'paid') data.paymentDate = new Date();
  }

  const updated = await prisma.invoice.update({ where: { id }, data });

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
 * Business rule: a 'paid' invoice can never be deleted — it must be
 * kept as a permanent financial record. Reverse it via status change
 * (Admin only) instead if it was paid in error.
 */
async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Invoice not found');

  if (existing.status === 'paid') {
    throw AppError.conflict(
      'A paid invoice cannot be deleted. Change its status instead if it was recorded in error.',
      'INVOICE_PAID_CANNOT_DELETE'
    );
  }

  await prisma.invoice.delete({ where: { id } });

  await writeAuditLog({ userId, action: 'delete', referenceId: id, ipAddress, oldValue: existing });
}

/** Resolves the parent projectId for an invoice (via its budget) — used by project-scope middleware. */
async function getProjectIdForInvoice(invoiceId) {
  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { budget: { select: { projectId: true } } },
  });
  return inv ? inv.budget.projectId : null;
}

module.exports = {
  listByBudget,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForInvoice,
};
