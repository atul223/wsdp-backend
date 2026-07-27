const express = require('express');
const controller = require('./resource.controller');
const {
  resourceCreateSchema,
  resourcePutSchema,
  resourcePatchSchema,
  validateBody,
} = require('./resourceDashboard.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByResourceId } = require('./resourceDashboard.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'resource_dashboard';

/**
 * @swagger
 * /projects/{projectId}/resources:
 *   get:
 *     summary: List resources registered for a project
 *     tags: [Resource Dashboard - Resources]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [equipment, manpower, material] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of resources
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "r1a2b3c4-1111-4a2b-9c3d-000000000001"
 *                   project_id: "9d0a1b2c-aaaa-4444-8888-000000000000"
 *                   name: "Excavator JCB-3D"
 *                   type: "equipment"
 *                   unit: "hours"
 *                   total_capacity: 400
 *                   notes: null
 *                   allocated_quantity: 120
 *                   remaining_capacity: 280
 *                   created_at: "2026-06-01T09:00:00.000Z"
 *                   updated_at: "2026-06-01T09:00:00.000Z"
 *               meta: { page: 1, limit: 20, total: 1, total_pages: 1 }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden - not a member of this project }
 *       404: { description: Project not found }
 */
router.get(
  '/projects/:projectId/resources',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

/**
 * @swagger
 * /projects/{projectId}/resources:
 *   post:
 *     summary: Register a resource for a project
 *     tags: [Resource Dashboard - Resources]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Excavator JCB-3D"
 *             type: "equipment"
 *             unit: "hours"
 *             total_capacity: 400
 *             notes: "Rented from vendor, on-site through Q3"
 *     responses:
 *       201:
 *         description: Resource created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Resource created successfully"
 *               data:
 *                 id: "r1a2b3c4-1111-4a2b-9c3d-000000000001"
 *                 project_id: "9d0a1b2c-aaaa-4444-8888-000000000000"
 *                 name: "Excavator JCB-3D"
 *                 type: "equipment"
 *                 unit: "hours"
 *                 total_capacity: 400
 *                 notes: "Rented from vendor, on-site through Q3"
 *                 allocated_quantity: 0
 *                 remaining_capacity: 400
 *                 created_at: "2026-07-16T10:00:00.000Z"
 *                 updated_at: "2026-07-16T10:00:00.000Z"
 *       400: { description: Validation error }
 *       404: { description: Project not found }
 *       409:
 *         description: Duplicate resource name within this project
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "DUPLICATE_RESOURCE"
 *                 message: 'A resource named "Excavator JCB-3D" already exists for this project.'
 */
router.post(
  '/projects/:projectId/resources',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(resourceCreateSchema),
  controller.create
);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get a single resource (includes allocated/remaining capacity)
 *     tags: [Resource Dashboard - Resources]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Resource found }
 *       404: { description: Resource not found }
 */
router.get(
  '/resources/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByResourceId,
  controller.getOne
);

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     summary: Fully replace a resource
 *     tags: [Resource Dashboard - Resources]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Excavator JCB-3D"
 *             type: "equipment"
 *             unit: "hours"
 *             total_capacity: 350
 *             notes: "Reduced after fleet reallocation"
 *     responses:
 *       200: { description: Resource updated }
 *       400: { description: Validation error }
 *       404: { description: Resource not found }
 *       409:
 *         description: New total_capacity is below already-committed allocation total
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "CAPACITY_BELOW_COMMITTED"
 *                 message: "total_capacity (350) cannot be less than the 380 already committed to active allocations for this resource."
 */
router.put(
  '/resources/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByResourceId,
  validateBody(resourcePutSchema),
  controller.fullUpdate
);

/**
 * @swagger
 * /resources/{id}:
 *   patch:
 *     summary: Partially update a resource
 *     tags: [Resource Dashboard - Resources]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             notes: "Now shared with an adjacent project"
 *     responses:
 *       200: { description: Resource updated }
 *       400: { description: Validation error - no fields provided }
 *       404: { description: Resource not found }
 *       409: { description: Duplicate resource name, or capacity below committed amount }
 */
router.patch(
  '/resources/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByResourceId,
  validateBody(resourcePatchSchema),
  controller.partialUpdate
);

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource (Admin/Project Manager only)
 *     description: Only resources with zero allocations can be deleted.
 *     tags: [Resource Dashboard - Resources]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Resource deleted }
 *       403: { description: Forbidden - Admin or Project Manager role required }
 *       404: { description: Resource not found }
 *       409:
 *         description: Resource has allocations and cannot be deleted
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: "RESOURCE_HAS_ALLOCATIONS"
 *                 message: "This resource has 4 allocation(s) and cannot be deleted."
 */
router.delete(
  '/resources/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByResourceId,
  controller.remove
);

module.exports = router;
