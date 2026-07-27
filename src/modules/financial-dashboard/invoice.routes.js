const express = require('express');
const controller = require('./invoice.controller');
const {
  invoiceCreateSchema,
  invoicePutSchema,
  invoicePatchSchema,
  validateBody,
} = require('./financialDashboard.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireRole } = require('../../middlewares/role.middleware');
const { scopeByBudgetParam, scopeByInvoiceId } = require('./financialDashboard.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'financial_dashboard';

/**
 * @swagger
 * /budgets/{budgetId}/invoices:
 *   get:
 *     summary: List invoices under a budget
 *     tags: [Financial Dashboard - Invoices]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, paid, rejected] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of invoices
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "c2f8d0b1-2222-4a2b-9c3d-000000000002"
 *                   budget_id: "b1e7c9a0-1111-4a2b-9c3d-000000000001"
 *                   invoice_number: "INV-2026-0045"
 *                   vendor_name: "Shree Steel & Cement Supplies"
 *                   amount: 120000
 *                   invoice_date: "2026-07-01"
 *                   due_date: "2026-07-31"
 *                   status: "approved"
 *                   payment_date: null
 *                   attachment_ids: []
 *                   submitted_by: "9d0a1b2c-user-4444-8888-000000000000"
 *                   created_at: "2026-07-01T09:00:00.000Z"
 *                   updated_at: "2026-07-02T11:00:00.000Z"
 *               meta: { page: 1, limit: 20, total: 1, total_pages: 1 }
 *       404: { description: Budget not found }
 */
router.get(
  '/budgets/:budgetId/invoices',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByBudgetParam,
  controller.list
);

/**
 * @swagger
 * /budgets/{budgetId}/invoices:
 *   post:
 *     summary: Submit a new invoice against a budget (status defaults to 'pending')
 *     tags: [Financial Dashboard - Invoices]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             invoice_number: "INV-2026-0045"
 *             vendor_name: "Shree Steel & Cement Supplies"
 *             amount: 120000
 *             invoice_date: "2026-07-01"
 *             due_date: "2026-07-31"
 *             attachment_ids: []
 *     responses:
 *       201:
 *         description: Invoice created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Invoice created successfully"
 *               data:
 *                 id: "c2f8d0b1-2222-4a2b-9c3d-000000000002"
 *                 budget_id: "b1e7c9a0-1111-4a2b-9c3d-000000000001"
 *                 invoice_number: "INV-2026-0045"
 *                 vendor_name: "Shree Steel & Cement Supplies"
 *                 amount: 120000
 *                 invoice_date: "2026-07-01"
 *                 due_date: "2026-07-31"
 *                 status: "pending"
 *                 payment_date: null
 *                 attachment_ids: []
 *                 submitted_by: "9d0a1b2c-user-4444-8888-000000000000"
 *                 created_at: "2026-07-16T10:00:00.000Z"
 *                 updated_at: "2026-07-16T10:00:00.000Z"
 *       400: { description: Validation error }
 *       404: { description: Budget not found }
 *       409:
 *         description: Invoice would exceed the budget's allocated amount, or duplicate invoice_number
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "BUDGET_EXCEEDED"
 *                 message: "This invoice would bring total commitments to 620000.00, exceeding the budget's allocated_amount of 500000.00 (currently 500000.00 committed)."
 */
router.post(
  '/budgets/:budgetId/invoices',
  authenticate,
  requirePermission(MODULE, 'create'),
  ...scopeByBudgetParam,
  validateBody(invoiceCreateSchema),
  controller.create
);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get a single invoice
 *     tags: [Financial Dashboard - Invoices]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Invoice found }
 *       404: { description: Invoice not found }
 */
router.get(
  '/invoices/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByInvoiceId,
  controller.getOne
);

/**
 * @swagger
 * /invoices/{id}:
 *   put:
 *     summary: Fully replace an invoice's core details (status unchanged)
 *     tags: [Financial Dashboard - Invoices]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             invoice_number: "INV-2026-0045"
 *             vendor_name: "Shree Steel & Cement Supplies Pvt Ltd"
 *             amount: 118000
 *             invoice_date: "2026-07-01"
 *             due_date: "2026-08-05"
 *             attachment_ids: []
 *     responses:
 *       200: { description: Invoice updated }
 *       400: { description: Validation error }
 *       403: { description: Invoice is paid and final - Admin only }
 *       404: { description: Invoice not found }
 *       409: { description: Would exceed budget allocation, or duplicate invoice_number }
 */
router.put(
  '/invoices/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByInvoiceId,
  validateBody(invoicePutSchema),
  controller.fullUpdate
);

/**
 * @swagger
 * /invoices/{id}:
 *   patch:
 *     summary: Partially update an invoice, including status transitions (pending -> approved -> paid, or -> rejected)
 *     tags: [Financial Dashboard - Invoices]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             status: "approved"
 *     responses:
 *       200: { description: Invoice updated }
 *       400: { description: Validation error - no fields provided, or invalid status value }
 *       403:
 *         description: Invoice status is final (paid/rejected) and only Admin may change it further
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "FORBIDDEN"
 *                 message: 'Invoice status "paid" is final. Only an Admin may change it further.'
 *       404: { description: Invoice not found }
 *       409: { description: Would exceed budget allocation }
 */
router.patch(
  '/invoices/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByInvoiceId,
  validateBody(invoicePatchSchema),
  controller.partialUpdate
);

/**
 * @swagger
 * /invoices/{id}:
 *   delete:
 *     summary: Delete an invoice (Admin only; paid invoices cannot be deleted)
 *     tags: [Financial Dashboard - Invoices]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Invoice deleted }
 *       403: { description: Forbidden - Admin role required }
 *       404: { description: Invoice not found }
 *       409:
 *         description: Paid invoices cannot be deleted
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "INVOICE_PAID_CANNOT_DELETE"
 *                 message: "A paid invoice cannot be deleted. Change its status instead if it was recorded in error."
 */
router.delete(
  '/invoices/:id',
  authenticate,
  requireRole(ROLES.ADMIN),
  ...scopeByInvoiceId,
  controller.remove
);

module.exports = router;
