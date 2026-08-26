const express = require('express');
const controller = require('./resourceSummary.controller');
const { resourceSummaryCardPatchSchema, validateBody } = require('./resourceDashboard.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'resource_dashboard';

/**
 * @swagger
 * /projects/{projectId}/resource-summary-cards:
 *   get:
 *     summary: Get the 4 Resource Dashboard summary cards (Materials Below Reorder, Equipment Utilization, Manpower Deployed, Idle/Maintenance), each with its auto-calculated value and any manual override
 *     tags: [Resource Dashboard - Summary Cards]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of 4 summary cards
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "s1a2b3c4-1111-4a2b-9c3d-000000000001"
 *                   project_id: "9d0a1b2c-aaaa-4444-8888-000000000000"
 *                   card_key: "materials_below_reorder"
 *                   label: "Materials Below Reorder"
 *                   auto_value: 1
 *                   value_override: null
 *                   note_override: null
 *                   effective_value: 1
 *                   effective_note: null
 *                   is_manual: false
 *                   updated_by: null
 *                   updated_at: null
 *       404: { description: Project not found }
 */
router.get(
  '/projects/:projectId/resource-summary-cards',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.list
);

/**
 * @swagger
 * /projects/{projectId}/resource-summary-cards/{cardKey}:
 *   patch:
 *     summary: Set a manual override value/note for a summary card
 *     tags: [Resource Dashboard - Summary Cards]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: cardKey
 *         required: true
 *         schema: { type: string, enum: [materials_below_reorder, equipment_utilization, manpower_deployed, idle_maintenance] }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             value_override: 2
 *             note_override: "2 material item(s) need attention"
 *     responses:
 *       200: { description: Card updated }
 *       400: { description: Validation error / unknown card key }
 *       404: { description: Project not found }
 */
router.patch(
  '/projects/:projectId/resource-summary-cards/:cardKey',
  authenticate,
  requirePermission(MODULE, 'update'),
  requireProjectScope((req) => req.params.projectId),
  validateBody(resourceSummaryCardPatchSchema),
  controller.upsert
);

/**
 * @swagger
 * /projects/{projectId}/resource-summary-cards/{cardKey}:
 *   delete:
 *     summary: Clear a manual override so the card reverts to its auto-calculated value
 *     tags: [Resource Dashboard - Summary Cards]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: cardKey
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Card reset to auto-calculated value }
 *       404: { description: Project not found }
 */
router.delete(
  '/projects/:projectId/resource-summary-cards/:cardKey',
  authenticate,
  requirePermission(MODULE, 'update'),
  requireProjectScope((req) => req.params.projectId),
  controller.reset
);

module.exports = router;
