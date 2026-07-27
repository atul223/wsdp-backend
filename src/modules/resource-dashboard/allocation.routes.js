const express = require('express');
const controller = require('./allocation.controller');
const {
  allocationCreateSchema,
  allocationPutSchema,
  allocationPatchSchema,
  validateBody,
} = require('./resourceDashboard.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireRole } = require('../../middlewares/role.middleware');
const { scopeByResourceParam, scopeByAllocationId } = require('./resourceDashboard.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'resource_dashboard';

/**
 * @swagger
 * /resources/{resourceId}/allocations:
 *   get:
 *     summary: List allocations against a resource
 *     tags: [Resource Dashboard - Allocations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [planned, in_use, completed, cancelled] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of allocations
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "a9f0e1d2-2222-4a2b-9c3d-000000000002"
 *                   resource_id: "r1a2b3c4-1111-4a2b-9c3d-000000000001"
 *                   work_package_id: "w8b7c6d5-3333-4a2b-9c3d-000000000003"
 *                   quantity: 40
 *                   allocation_date: "2026-07-10"
 *                   status: "in_use"
 *                   remarks: "Foundation excavation, Block C"
 *                   allocated_by: "9d0a1b2c-user-4444-8888-000000000000"
 *                   created_at: "2026-07-10T09:00:00.000Z"
 *                   updated_at: "2026-07-11T08:00:00.000Z"
 *               meta: { page: 1, limit: 20, total: 1, total_pages: 1 }
 *       404: { description: Resource not found }
 */
router.get(
  '/resources/:resourceId/allocations',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByResourceParam,
  controller.list
);

/**
 * @swagger
 * /resources/{resourceId}/allocations:
 *   post:
 *     summary: Create a new allocation against a resource (status defaults to 'planned')
 *     tags: [Resource Dashboard - Allocations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             work_package_id: "w8b7c6d5-3333-4a2b-9c3d-000000000003"
 *             quantity: 40
 *             allocation_date: "2026-07-10"
 *             remarks: "Foundation excavation, Block C"
 *     responses:
 *       201:
 *         description: Allocation created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Allocation created successfully"
 *               data:
 *                 id: "a9f0e1d2-2222-4a2b-9c3d-000000000002"
 *                 resource_id: "r1a2b3c4-1111-4a2b-9c3d-000000000001"
 *                 work_package_id: "w8b7c6d5-3333-4a2b-9c3d-000000000003"
 *                 quantity: 40
 *                 allocation_date: "2026-07-10"
 *                 status: "planned"
 *                 remarks: "Foundation excavation, Block C"
 *                 allocated_by: "9d0a1b2c-user-4444-8888-000000000000"
 *                 created_at: "2026-07-16T10:00:00.000Z"
 *                 updated_at: "2026-07-16T10:00:00.000Z"
 *       400: { description: Validation error }
 *       404: { description: Resource or work package not found }
 *       422: { description: work_package_id does not belong to the same project as the resource }
 *       409:
 *         description: Allocation would exceed the resource's total capacity, or a duplicate allocation already exists
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "CAPACITY_EXCEEDED"
 *                 message: "This allocation would bring total commitments to 440.00, exceeding the resource's total_capacity of 400.00 (currently 400.00 committed)."
 */
router.post(
  '/resources/:resourceId/allocations',
  authenticate,
  requirePermission(MODULE, 'create'),
  ...scopeByResourceParam,
  validateBody(allocationCreateSchema),
  controller.create
);

/**
 * @swagger
 * /allocations/{id}:
 *   get:
 *     summary: Get a single allocation
 *     tags: [Resource Dashboard - Allocations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Allocation found }
 *       404: { description: Allocation not found }
 */
router.get(
  '/allocations/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByAllocationId,
  controller.getOne
);

/**
 * @swagger
 * /allocations/{id}:
 *   put:
 *     summary: Fully replace an allocation's core details (status unchanged)
 *     tags: [Resource Dashboard - Allocations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             work_package_id: "w8b7c6d5-3333-4a2b-9c3d-000000000003"
 *             quantity: 35
 *             allocation_date: "2026-07-11"
 *             remarks: "Reduced after schedule shift"
 *     responses:
 *       200: { description: Allocation updated }
 *       400: { description: Validation error }
 *       403: { description: Allocation is completed and final - Admin/PM only }
 *       404: { description: Allocation, resource, or work package not found }
 *       409: { description: Would exceed resource capacity, or duplicate allocation }
 *       422: { description: work_package_id does not belong to the same project as the resource }
 */
router.put(
  '/allocations/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByAllocationId,
  validateBody(allocationPutSchema),
  controller.fullUpdate
);

/**
 * @swagger
 * /allocations/{id}:
 *   patch:
 *     summary: Partially update an allocation, including status transitions (planned -> in_use -> completed, or -> cancelled)
 *     tags: [Resource Dashboard - Allocations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             status: "in_use"
 *     responses:
 *       200: { description: Allocation updated }
 *       400: { description: Validation error - no fields provided, or invalid status value }
 *       403:
 *         description: Allocation status is final (completed/cancelled) and only Admin/PM may change it further
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "FORBIDDEN"
 *                 message: 'Allocation status "completed" is final. Only an Admin or Project Manager may change it further.'
 *       404: { description: Allocation not found }
 *       409: { description: Would exceed resource capacity }
 */
router.patch(
  '/allocations/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByAllocationId,
  validateBody(allocationPatchSchema),
  controller.partialUpdate
);

/**
 * @swagger
 * /allocations/{id}:
 *   delete:
 *     summary: Delete an allocation (Admin/Project Manager only; completed allocations cannot be deleted)
 *     tags: [Resource Dashboard - Allocations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Allocation deleted }
 *       403: { description: Forbidden - Admin or Project Manager role required }
 *       404: { description: Allocation not found }
 *       409:
 *         description: Completed allocations cannot be deleted
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "ALLOCATION_COMPLETED_CANNOT_DELETE"
 *                 message: "A completed allocation cannot be deleted. Change its status instead if it was recorded in error."
 */
router.delete(
  '/allocations/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByAllocationId,
  controller.remove
);

module.exports = router;
