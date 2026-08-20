const express = require('express');
const controller = require('./workforceEmployer.controller');
const {
  workforceEmployerCreateSchema,
  workforceEmployerPutSchema,
  workforceEmployerPatchSchema,
  validateBody,
} = require('./resourceDashboard.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByWorkforceEmployerId } = require('./resourceDashboard.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'resource_dashboard';

/**
 * @swagger
 * /projects/{projectId}/workforce-employers:
 *   get:
 *     summary: List workforce-by-employer rows for a project
 *     tags: [Resource Dashboard - Workforce By Employer]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated list of workforce rows
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "w1a2b3c4-1111-4a2b-9c3d-000000000001"
 *                   project_id: "9d0a1b2c-aaaa-4444-8888-000000000000"
 *                   group_name: "CTCE Direct (17)"
 *                   category: "Construction Manager"
 *                   headcount: 1
 *                   is_total: false
 *                   sort_order: 0
 *               meta: { page: 1, limit: 50, total: 1, total_pages: 1 }
 *       404: { description: Project not found }
 */
router.get(
  '/projects/:projectId/workforce-employers',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

/**
 * @swagger
 * /projects/{projectId}/workforce-employers:
 *   post:
 *     summary: Add a workforce-by-employer row for a project
 *     tags: [Resource Dashboard - Workforce By Employer]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             group_name: "XINYI Subcontractor (58)"
 *             category: "Skilled"
 *             headcount: 4
 *     responses:
 *       201: { description: Record created }
 *       400: { description: Validation error }
 *       404: { description: Project not found }
 */
router.post(
  '/projects/:projectId/workforce-employers',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(workforceEmployerCreateSchema),
  controller.create
);

/**
 * @swagger
 * /workforce-employers/{id}:
 *   get:
 *     summary: Get a single workforce row
 *     tags: [Resource Dashboard - Workforce By Employer]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Record found }
 *       404: { description: Record not found }
 */
router.get(
  '/workforce-employers/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByWorkforceEmployerId,
  controller.getOne
);

/**
 * @swagger
 * /workforce-employers/{id}:
 *   put:
 *     summary: Fully replace a workforce row
 *     tags: [Resource Dashboard - Workforce By Employer]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Record updated }
 *       400: { description: Validation error }
 *       404: { description: Record not found }
 */
router.put(
  '/workforce-employers/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByWorkforceEmployerId,
  validateBody(workforceEmployerPutSchema),
  controller.fullUpdate
);

/**
 * @swagger
 * /workforce-employers/{id}:
 *   patch:
 *     summary: Partially update a workforce row
 *     tags: [Resource Dashboard - Workforce By Employer]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Record updated }
 *       400: { description: Validation error - no fields provided }
 *       404: { description: Record not found }
 */
router.patch(
  '/workforce-employers/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByWorkforceEmployerId,
  validateBody(workforceEmployerPatchSchema),
  controller.partialUpdate
);

/**
 * @swagger
 * /workforce-employers/{id}:
 *   delete:
 *     summary: Delete a workforce row (Admin/Project Manager only)
 *     tags: [Resource Dashboard - Workforce By Employer]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Record deleted }
 *       403: { description: Forbidden - Admin or Project Manager role required }
 *       404: { description: Record not found }
 */
router.delete(
  '/workforce-employers/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByWorkforceEmployerId,
  controller.remove
);

module.exports = router;
