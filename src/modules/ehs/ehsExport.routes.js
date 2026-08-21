const express = require('express');
const controller = require('./ehsExport.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requirePermission, requireProjectScope } = require('../../middlewares/role.middleware');

const router = express.Router();
const MODULE = 'ehs';

// GET /projects/:projectId/ehs-export
// Consolidated JSON snapshot of every EHS data source for this project.
// The frontend Export button fetches this and renders it into a PDF
// client-side (jsPDF + html2canvas) — see js/ehs.js -> exportToPdf().
router.get(
  '/projects/:projectId/ehs-export',
  authenticate,
  requirePermission(MODULE, 'read'),
  requireProjectScope((req) => req.params.projectId),
  controller.getSnapshot
);

module.exports = router;
