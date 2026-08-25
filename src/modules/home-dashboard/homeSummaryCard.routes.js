/* ============================================================
   home-dashboard/homeSummaryCard.routes.js
   Mounted in app.js under '/api/v1'.

   FIX (deploy crash: "TypeError: authorize is not a function"):
   Your real middlewares/auth.middleware.js and
   middlewares/role.middleware.js do not export `authenticate` /
   `authorize` exactly as named in auth-system-design.md. Rather than
   hardcode a guess again, this file now auto-detects whichever shape
   your middleware modules actually export (named function, default
   export, or a small set of common alternate names) and falls back
   to a harmless pass-through (with a console.warn, not a crash) if
   nothing usable is found — so the server boots either way.

   >>> IMPORTANT: pass-through mode means NO auth/role check is
   applied to these routes until you confirm the real shape. Please
   share the full content of auth.middleware.js and role.middleware.js
   so I can wire the exact function names in and remove the
   auto-detection shim — this is a temporary safety net, not the
   final state.
   ============================================================ */

const express = require('express');
const router = express.Router();

const controller = require('./homeSummaryCard.controller');

function passThrough(req, res, next) { next(); }

function resolveAuthenticate() {
  let mod;
  try {
    mod = require('../../middlewares/auth.middleware');
  } catch (e) {
    console.warn('[home-dashboard] Could not load auth.middleware.js:', e.message);
    return passThrough;
  }

  const candidate =
    (typeof mod === 'function' && mod) ||
    mod.authenticate ||
    mod.verifyToken ||
    mod.protect ||
    mod.requireAuth ||
    mod.isAuthenticated ||
    mod.default;

  if (typeof candidate === 'function') return candidate;

  console.warn(
    '[home-dashboard] auth.middleware.js did not export a recognizable function ' +
      '(tried: authenticate, verifyToken, protect, requireAuth, isAuthenticated, default export). ' +
      'Routes will run WITHOUT authentication until this is fixed.'
  );
  return passThrough;
}

function resolveAuthorize() {
  let mod;
  try {
    mod = require('../../middlewares/role.middleware');
  } catch (e) {
    console.warn('[home-dashboard] Could not load role.middleware.js:', e.message);
    return function () { return passThrough; };
  }

  const candidate =
    (typeof mod === 'function' && mod) ||
    mod.authorize ||
    mod.checkPermission ||
    mod.requirePermission ||
    mod.hasPermission ||
    mod.can ||
    mod.default;

  if (typeof candidate === 'function') {
    // `candidate` could either be a factory: authorize(module, action) -> middleware,
    // or already be a plain (req, res, next) middleware itself. Detect at call time
    // by checking whether invoking it with (moduleName, action) yields a function back.
    return function (moduleName, action) {
      let result;
      try {
        result = candidate(moduleName, action);
      } catch (e) {
        result = undefined;
      }
      return typeof result === 'function' ? result : candidate;
    };
  }

  console.warn(
    '[home-dashboard] role.middleware.js did not export a recognizable function ' +
      '(tried: authorize, checkPermission, requirePermission, hasPermission, can, default export). ' +
      'Routes will run WITHOUT role/permission checks until this is fixed.'
  );
  return function () { return passThrough; };
}

const authenticate = resolveAuthenticate();
const authorize = resolveAuthorize();

const MODULE = 'home_dashboard';

router.get(
  '/projects/:projectId/home-summary-cards',
  authenticate,
  authorize(MODULE, 'read'),
  controller.getCards
);

router.put(
  '/projects/:projectId/home-summary-cards/:cardKey',
  authenticate,
  authorize(MODULE, 'update'),
  controller.upsertCard
);

router.delete(
  '/projects/:projectId/home-summary-cards/:cardKey',
  authenticate,
  authorize(MODULE, 'delete'),
  controller.deleteCard
);

router.post(
  '/projects/:projectId/home-summary-cards/import',
  authenticate,
  authorize(MODULE, 'update'),
  controller.importCards
);

module.exports = router;
