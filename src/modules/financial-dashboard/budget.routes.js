const express = require('express');
const controller = require('./budget.controller');
const {
  budgetCreateSchema,
  budgetPutSchema,
  budgetPatchSchema,
  validateBody,
} = require('./financialDashboard.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByBudgetId } = require('./financialDashboard.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'financial_dashboard';

/**
 * @swagger
 * /projects/{projectId}/budgets:
 *   get:
 *     summary: List budget lines for a project
 *     tags: [Financial Dashboard - Budgets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *         description: e.g. fiscal_year, -allocated_amount
 *     responses:
 *       200:
 *         description: Paginated list of budgets
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "b1e7c9a0-1111-4a2b-9c3d-000000000001"
 *                   project_id: "9d0a1b2c-aaaa-4444-8888-000000000000"
 *                   category: "Materials"
 *                   fiscal_year: 2026
 *                   allocated_amount: 500000
 *                   currency: "INR"
 *                   notes: null
 *                   utilized_amount: 120000
 *                   remaining_amount: 380000
 *                   created_at: "2026-06-01T09:00:00.000Z"
 *                   updated_at: "2026-06-01T09:00:00.000Z"
 *               meta: { page: 1, limit: 20, total: 1, total_pages: 1 }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden - not a member of this project }
 *       404: { description: Project not found }
 */
router.get(
  '/projects/:projectId/budgets',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

/**
 * @swagger
 * /projects/{projectId}/budgets:
 *   post:
 *     summary: Create a budget line for a project
 *     tags: [Financial Dashboard - Budgets]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             category: "Materials"
 *             fiscal_year: 2026
 *             allocated_amount: 500000
 *             currency: "INR"
 *             notes: "Cement, steel, pipes"
 *     responses:
 *       201:
 *         description: Budget created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Budget created successfully"
 *               data:
 *                 id: "b1e7c9a0-1111-4a2b-9c3d-000000000001"
 *                 project_id: "9d0a1b2c-aaaa-4444-8888-000000000000"
 *                 category: "Materials"
 *                 fiscal_year: 2026
 *                 allocated_amount: 500000
 *                 currency: "INR"
 *                 notes: "Cement, steel, pipes"
 *                 utilized_amount: 0
 *                 remaining_amount: 500000
 *                 created_at: "2026-07-16T10:00:00.000Z"
 *                 updated_at: "2026-07-16T10:00:00.000Z"
 *       400: { description: Validation error }
 *       404: { description: Project not found }
 *       409:
 *         description: Duplicate budget line (same category + fiscal_year)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "DUPLICATE_BUDGET_LINE"
 *                 message: 'A budget line already exists for category "Materials" in fiscal year 2026.'
 */
router.post(
  '/projects/:projectId/budgets',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(budgetCreateSchema),
  controller.create
);

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     summary: Get a single budget line (includes utilized/remaining amounts)
 *     tags: [Financial Dashboard - Budgets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Budget found }
 *       404: { description: Budget not found }
 */
router.get(
  '/budgets/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByBudgetId,
  controller.getOne
);

/**
 * @swagger
 * /budgets/{id}:
 *   put:
 *     summary: Fully replace a budget line
 *     tags: [Financial Dashboard - Budgets]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             category: "Materials"
 *             fiscal_year: 2026
 *             allocated_amount: 450000
 *             currency: "INR"
 *             notes: "Revised after Q2 review"
 *     responses:
 *       200: { description: Budget updated }
 *       400: { description: Validation error }
 *       404: { description: Budget not found }
 *       409:
 *         description: New allocated_amount is below already-committed invoice total
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "ALLOCATION_BELOW_COMMITTED"
 *                 message: "allocated_amount (450000) cannot be less than the 480000 already committed to active invoices under this budget."
 */
router.put(
  '/budgets/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByBudgetId,
  validateBody(budgetPutSchema),
  controller.fullUpdate
);

/**
 * @swagger
 * /budgets/{id}:
 *   patch:
 *     summary: Partially update a budget line
 *     tags: [Financial Dashboard - Budgets]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             notes: "Updated after vendor negotiation"
 *     responses:
 *       200: { description: Budget updated }
 *       400: { description: Validation error - no fields provided }
 *       404: { description: Budget not found }
 *       409: { description: Duplicate budget line, or allocation below committed amount }
 */
router.patch(
  '/budgets/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByBudgetId,
  validateBody(budgetPatchSchema),
  controller.partialUpdate
);

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     summary: Delete a budget line (Admin only)
 *     description: Only budgets with zero invoices can be deleted.
 *     tags: [Financial Dashboard - Budgets]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Budget deleted }
 *       403: { description: Forbidden - Admin role required }
 *       404: { description: Budget not found }
 *       409:
 *         description: Budget has invoices and cannot be deleted
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "BUDGET_HAS_INVOICES"
 *                 message: "This budget has 3 invoice(s) and cannot be deleted."
 */
router.delete(
  '/budgets/:id',
  authenticate,
  requireRole(ROLES.ADMIN),
  ...scopeByBudgetId,
  controller.remove
);

module.exports = router;
