// Canonical role names — must match prisma/seed.js and the `roles` table.
const ROLES = Object.freeze({
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  SITE_ENGINEER: 'site_engineer',
  PLANNING_ENGINEER: 'planning_engineer',
  FINANCE: 'finance',
  CLIENT: 'client',
  READ_ONLY_USER: 'read_only_user',
});

// Roles that bypass project-level scoping and can see all projects.
const GLOBAL_SCOPE_ROLES = [ROLES.ADMIN, ROLES.READ_ONLY_USER];

module.exports = { ROLES, GLOBAL_SCOPE_ROLES };
