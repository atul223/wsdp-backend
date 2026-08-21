const express = require('express');
const controller = require('./ehsImport.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'ehs';

// GET /projects/:projectId/ehs-import/targets
// Tells the frontend which import targets exist and what CSV headers
// each one expects — used to populate the Import modal's dropdown and
// validate the uploaded file's header row before submitting.
router.get(
  '/projects/:projectId/ehs-import/targets',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.getTargets
);

// POST /projects/:projectId/ehs-import
// Body: { table: 'incident_summary'|'nonconformity_summary'|'resource_consumption', rows: [{...}, ...] }
router.post(
  '/projects/:projectId/ehs-import',
  authenticate,
  requirePermission(MODULE, 'create'),
  requireProjectScope((req) => req.params.projectId),
  controller.importRows
);

module.exports = router;
