
const express = require('express');
const router = express.Router();

const controller = require('./project.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.get(
  '/projects',
  authenticate,
  controller.listProjects
);

module.exports = router;