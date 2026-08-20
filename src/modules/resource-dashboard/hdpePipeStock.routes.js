const express = require('express');
const controller = require('./hdpePipeStock.controller');
const {
  hdpePipeStockCreateSchema,
  hdpePipeStockPutSchema,
  hdpePipeStockPatchSchema,
  validateBody,
} = require('./resourceDashboard.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByHdpePipeStockId } = require('./resourceDashboard.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'resource_dashboard';

/**
 * @swagger
 * /projects/{projectId}/hdpe-pipe-stock:
 *   get:
 *     summary: List HDPE pipe stock entries for a project
 *     tags: [Resource Dashboard - HDPE Pipe Stock]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Paginated list of HDPE pipe stock entries
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "h1a2b3c4-1111-4a2b-9c3d-000000000001"
 *                   project_id: "9d0a1b2c-aaaa-4444-8888-000000000000"
 *                   diameter: "De20 PN16"
 *                   received_m: 41100
 *                   used_m: 1200
 *                   stock_m: 39900
 *                   cover: "OK"
 *                   sort_order: 0
 *               meta: { page: 1, limit: 20, total: 1, total_pages: 1 }
 *       404: { description: Project not found }
 */
router.get(
  '/projects/:projectId/hdpe-pipe-stock',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

/**
 * @swagger
 * /projects/{projectId}/hdpe-pipe-stock:
 *   post:
 *     summary: Add an HDPE pipe stock entry for a project
 *     tags: [Resource Dashboard - HDPE Pipe Stock]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             diameter: "De110 PN10"
 *             received_m: 3420
 *             used_m: 1032
 *     responses:
 *       201: { description: Record created }
 *       400: { description: Validation error }
 *       404: { description: Project not found }
 *       409: { description: Duplicate diameter within this project }
 */
router.post(
  '/projects/:projectId/hdpe-pipe-stock',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(hdpePipeStockCreateSchema),
  controller.create
);

/**
 * @swagger
 * /hdpe-pipe-stock/{id}:
 *   get:
 *     summary: Get a single HDPE pipe stock entry
 *     tags: [Resource Dashboard - HDPE Pipe Stock]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Record found }
 *       404: { description: Record not found }
 */
router.get(
  '/hdpe-pipe-stock/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByHdpePipeStockId,
  controller.getOne
);

/**
 * @swagger
 * /hdpe-pipe-stock/{id}:
 *   put:
 *     summary: Fully replace an HDPE pipe stock entry
 *     tags: [Resource Dashboard - HDPE Pipe Stock]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Record updated }
 *       400: { description: Validation error }
 *       404: { description: Record not found }
 *       409: { description: Duplicate diameter }
 */
router.put(
  '/hdpe-pipe-stock/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByHdpePipeStockId,
  validateBody(hdpePipeStockPutSchema),
  controller.fullUpdate
);

/**
 * @swagger
 * /hdpe-pipe-stock/{id}:
 *   patch:
 *     summary: Partially update an HDPE pipe stock entry
 *     tags: [Resource Dashboard - HDPE Pipe Stock]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Record updated }
 *       400: { description: Validation error - no fields provided }
 *       404: { description: Record not found }
 */
router.patch(
  '/hdpe-pipe-stock/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByHdpePipeStockId,
  validateBody(hdpePipeStockPatchSchema),
  controller.partialUpdate
);

/**
 * @swagger
 * /hdpe-pipe-stock/{id}:
 *   delete:
 *     summary: Delete an HDPE pipe stock entry (Admin/Project Manager only)
 *     tags: [Resource Dashboard - HDPE Pipe Stock]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Record deleted }
 *       403: { description: Forbidden - Admin or Project Manager role required }
 *       404: { description: Record not found }
 */
router.delete(
  '/hdpe-pipe-stock/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByHdpePipeStockId,
  controller.remove
);

module.exports = router;
