const express = require('express');
const controller = require('./auth.controller');
const {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  validateBody,
} = require('./auth.validation');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { loginLimiter, forgotPasswordLimiter, refreshLimiter } = require('../../middlewares/rateLimit.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = express.Router();

// Public
router.post('/login', loginLimiter, validateBody(loginSchema), controller.login);
router.post('/refresh', refreshLimiter, controller.refresh);
router.post('/password/forgot', forgotPasswordLimiter, validateBody(forgotPasswordSchema), controller.forgotPassword);
router.post('/password/reset', validateBody(resetPasswordSchema), controller.resetPassword);

// Authenticated
router.post('/logout', authenticate, controller.logout);
router.post('/password/change', authenticate, validateBody(changePasswordSchema), controller.changePassword);
router.get('/me', authenticate, controller.getMe);
router.get('/sessions', authenticate, controller.listSessions);
router.delete('/sessions/:id', authenticate, controller.revokeSession);
router.delete('/sessions', authenticate, controller.revokeAllSessions);

// Admin-only
router.delete(
  '/users/:id/sessions',
  authenticate,
  requireRole(ROLES.ADMIN),
  controller.adminRevokeUserSessions
);

module.exports = router;
