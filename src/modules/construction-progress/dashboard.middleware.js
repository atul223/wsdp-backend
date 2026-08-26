/**
 * src/modules/construction-progress/dashboard.middleware.js
 * *** NEW FILE ***
 *
 * Project-scoping helpers for the tables served off dashboard.routes.js
 * (Pipeline Sections, House Clusters, Testing Activities, Bridge
 * Crossings, Valve/Pipeline/House Summaries, Area-Wise / Pipe-Diameter-
 * Wise / Activity-Wise Progress). These routes previously had NO scoping
 * (and no permission check at all — see dashboard.routes.js).
 *
 * Mirrors the exact same scopeBy*Id pattern already used in
 * constructionProgress.middleware.js (work packages / progress entries)
 * and resourceDashboard.middleware.js — a lookup step resolves the
 * owning project id, then requireProjectScope() confirms the caller
 * (Admin/Read Only bypass; everyone else must be a project member).
 */
const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const { requireProjectScope } = require('../../middlewares/role.middleware');

/**
 * Generic factory for endpoints keyed by /<resource>/:id. All of the
 * models below carry a `projectId` column directly, so a single lookup
 * is enough to resolve scope — no need for a per-entity service import.
 */
function scopeById(prismaModelKey, notFoundMessage) {
  return [
    async (req, res, next) => {
      try {
        const row = await prisma[prismaModelKey].findUnique({
          where: { id: req.params.id },
          select: { projectId: true },
        });
        if (!row) return next(AppError.notFound(notFoundMessage));
        req.resolvedProjectId = row.projectId;
        next();
      } catch (err) {
        next(err);
      }
    },
    requireProjectScope((req) => req.resolvedProjectId),
  ];
}

/**
 * For CREATE (POST) endpoints — there's no :id in the URL yet, so scope
 * is checked against the projectId the frontend sends in the request
 * body (this module's payloads use camelCase `projectId`, matching the
 * Prisma field name directly, unlike other modules which snake_case +
 * Zod-validate). If you later add Zod validation here, keep this key
 * in sync with whatever field name the validated body ends up using.
 */
const scopeByBodyProjectId = requireProjectScope(
  (req) => req.body?.projectId || req.body?.project_id
);

/** For endpoints keyed by /<resource>/:projectId (valve/pipeline/house summaries). */
const scopeByParamProjectId = requireProjectScope((req) => req.params.projectId);

module.exports = {
  scopeByPipelineSectionId: scopeById('pipelineSection', 'Pipeline section not found'),
  scopeByHouseClusterId: scopeById('houseConnectionCluster', 'House connection cluster not found'),
  scopeByTestingActivityId: scopeById('testingActivity', 'Testing activity not found'),
  scopeByBridgeCrossingId: scopeById('bridgeCrossing', 'Bridge crossing not found'),
  scopeByAreaProgressId: scopeById('areaWiseProgress', 'Area-wise progress record not found'),
  scopeByPipeDiameterProgressId: scopeById('pipeDiameterProgress', 'Pipe diameter progress record not found'),
  scopeByActivityProgressId: scopeById('activityWiseProgress', 'Activity-wise progress record not found'),
  scopeByBodyProjectId,
  scopeByParamProjectId,
};
