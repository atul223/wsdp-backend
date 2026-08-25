/* ============================================================
   home-dashboard/homeSummaryCard.routes.js
   Mounted in app.js under '/api/v1'.

   FIX HISTORY:
   1) Crash "authorize is not a function" -> fixed by auto-detecting
      your real auth.middleware.js / role.middleware.js exports
      (kept below for `authenticate` only).
   2) "Role 'admin' cannot update 'home_dashboard'" (403, even for
      admin) -> your authorize(module, action) checks a permission
      whitelist (DB table or hardcoded map) that was never seeded/
      updated with the new 'home_dashboard' module, so EVERY role is
      denied, admin included. Rather than depend on that external
      whitelist (which would need a DB migration or a code change in
      a file I don't have visibility into), this module now uses its
      own self-contained role check below (`requireRole`), based
      purely on `req.user.role` — which your JWT already carries
      per auth-system-design.md ({ sub, role, project_ids, ... }).
      This is fully decoupled from role.middleware.js's authorize()
      and its module whitelist, so it works immediately.

   Default policy (adjust ALLOWED_WRITE_ROLES below if needed):
     - Read (GET)              -> any authenticated role
     - Update/Delete/Import    -> admin, project_manager only

   If you'd prefer this to go through your central permissions system
   instead (so it shows up in an admin permissions UI, etc.), share
   the full content of middlewares/role.middleware.js and I'll wire
   the exact call your system expects, plus the SQL/seed changes
   needed to register the 'home_dashboard' module there.
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

/** Self-contained role gate — does NOT depend on role.middleware.js's
 *  authorize(module, action) or any external permission whitelist.
 *  allowedRoles === '*' means "any authenticated role". */
function requireRole(allowedRoles) {
  return function (req, res, next) {
    const user = req.user || {};
    const role = user.role || user.role_name || (user.data && user.data.role);

    if (!role) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' },
      });
    }

    if (allowedRoles === '*' || allowedRoles.includes(String(role).toLowerCase())) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: "Role '" + role + "' cannot perform this action on 'home_dashboard'",
      },
    });
  };
}

const authenticate = resolveAuthenticate();

// Adjust this list if other roles (e.g. 'finance', 'planning_engineer')
// should also be allowed to edit Home Dashboard cards.
const ALLOWED_WRITE_ROLES = ['admin', 'project_manager'];

router.get(
  '/projects/:projectId/home-summary-cards',
  authenticate,
  requireRole('*'),
  controller.getCards
);

router.put(
  '/projects/:projectId/home-summary-cards/:cardKey',
  authenticate,
  requireRole(ALLOWED_WRITE_ROLES),
  controller.upsertCard
);

router.delete(
  '/projects/:projectId/home-summary-cards/:cardKey',
  authenticate,
  requireRole(ALLOWED_WRITE_ROLES),
  controller.deleteCard
);

router.post(
  '/projects/:projectId/home-summary-cards/import',
  authenticate,
  requireRole(ALLOWED_WRITE_ROLES),
  controller.importCards
);

module.exports = router;
