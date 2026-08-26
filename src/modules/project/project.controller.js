/**
 * src/modules/project/project.controller.js
 *
 * *** SECURITY FIX ***
 * Previously `listProjects` returned EVERY project in the database to
 * ANY authenticated user, regardless of role or project membership.
 * With only one project (WSDP-LUBANGO-001) this had no visible effect,
 * but it's a real data-leak the moment a second project is added, and
 * it's the wrong foundation to layer a read-only Client role on top of
 * — a Client must only ever see the project(s) they're a member of.
 *
 * Fixed by filtering to req.user.projectIds (embedded in the JWT at
 * login, see token.util.js) for every role EXCEPT the roles that are
 * meant to see all projects globally (admin, read_only_user — see
 * GLOBAL_SCOPE_ROLES in common/constants/roles.js). This mirrors the
 * exact same canAccessProject/GLOBAL_SCOPE_ROLES pattern already used
 * in dashboard.service.js and role.middleware.js's requireProjectScope,
 * so behavior is consistent across the whole app.
 *
 * No other behavior changed — response shape is identical.
 */

const prisma = require('../../config/db');
const { GLOBAL_SCOPE_ROLES } = require('../../common/constants/roles');

async function listProjects(req, res, next) {
  try {
    const isGlobalScope = GLOBAL_SCOPE_ROLES.includes(req.user.role);
    const projectIds = req.user.projectIds || [];

    // Non-global-scope user with no project membership -> empty list,
    // not an error (matches "no access" being a valid, quiet state).
    if (!isGlobalScope && projectIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const projects = await prisma.project.findMany({
      where: isGlobalScope ? {} : { id: { in: projectIds } },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjects
};
