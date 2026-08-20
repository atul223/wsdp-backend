const express = require('express');
const controller = require('./equipmentDeployment.controller');
const {
  equipmentDeploymentCreateSchema,
  equipmentDeploymentPutSchema,
  equipmentDeploymentPatchSchema,
  validateBody,
} = require('./resourceDashboard.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope, requireRole } = require('../../middlewares/role.middleware');
const { scopeByEquipmentDeploymentId } = require('./resourceDashboard.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();
const MODULE = 'resource_dashboard';

/**
 * @swagger
 * /projects/{projectId}/equipment-deployments:
 *   get:
 *     summary: List equipment deployment entries for a project
 *     tags: [Resource Dashboard - Equipment Deployment]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated list of equipment deployment entries
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "e1a2b3c4-1111-4a2b-9c3d-000000000001"
 *                   project_id: "9d0a1b2c-aaaa-4444-8888-000000000000"
 *                   category: "Earthmoving (Excavator, dump truck, backhoe)"
 *                   planned: null
 *                   deployed: 4
 *                   variance: null
 *                   remarks: "No planned baseline set"
 *                   is_total: false
 *                   sort_order: 0
 *               meta: { page: 1, limit: 20, total: 1, total_pages: 1 }
 *       404: { description: Project not found }
 */
router.get(
  '/projects/:projectId/equipment-deployments',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

/**
 * @swagger
 * /projects/{projectId}/equipment-deployments:
 *   post:
 *     summary: Add an equipment deployment entry for a project
 *     tags: [Resource Dashboard - Equipment Deployment]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             category: "Survey (GPS, level)"
 *             planned: null
 *             deployed: 2
 *             remarks: "Minimum required; no spare unit available"
 *     responses:
 *       201: { description: Record created }
 *       400: { description: Validation error }
 *       404: { description: Project not found }
 */
router.post(
  '/projects/:projectId/equipment-deployments',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(equipmentDeploymentCreateSchema),
  controller.create
);

/**
 * @swagger
 * /equipment-deployments/{id}:
 *   get:
 *     summary: Get a single equipment deployment entry
 *     tags: [Resource Dashboard - Equipment Deployment]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Record found }
 *       404: { description: Record not found }
 */
router.get(
  '/equipment-deployments/:id',
  authenticate,
  requirePermission(MODULE, 'read'),
  ...scopeByEquipmentDeploymentId,
  controller.getOne
);

/**
 * @swagger
 * /equipment-deployments/{id}:
 *   put:
 *     summary: Fully replace an equipment deployment entry
 *     tags: [Resource Dashboard - Equipment Deployment]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Record updated }
 *       400: { description: Validation error }
 *       404: { description: Record not found }
 */
router.put(
  '/equipment-deployments/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByEquipmentDeploymentId,
  validateBody(equipmentDeploymentPutSchema),
  controller.fullUpdate
);

/**
 * @swagger
 * /equipment-deployments/{id}:
 *   patch:
 *     summary: Partially update an equipment deployment entry
 *     tags: [Resource Dashboard - Equipment Deployment]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Record updated }
 *       400: { description: Validation error - no fields provided }
 *       404: { description: Record not found }
 */
router.patch(
  '/equipment-deployments/:id',
  authenticate,
  requirePermission(MODULE, 'update'),
  ...scopeByEquipmentDeploymentId,
  validateBody(equipmentDeploymentPatchSchema),
  controller.partialUpdate
);

/**
 * @swagger
 * /equipment-deployments/{id}:
 *   delete:
 *     summary: Delete an equipment deployment entry (Admin/Project Manager only)
 *     tags: [Resource Dashboard - Equipment Deployment]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Record deleted }
 *       403: { description: Forbidden - Admin or Project Manager role required }
 *       404: { description: Record not found }
 */
router.delete(
  '/equipment-deployments/:id',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  ...scopeByEquipmentDeploymentId,
  controller.remove
);

module.exports = router;
