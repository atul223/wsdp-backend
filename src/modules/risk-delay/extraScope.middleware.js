/* ============================================================
   extraScope.middleware.js
   Project-scope resolution for the id-based routes of the new
   Non-Conformity and Corrective Action modules — mirrors the same
   pattern used by `scopeByRiskId` / `scopeByDelayId` in
   riskDelay.middleware.js (look up the record's project, then run
   the existing requireProjectScope check against it).
   ============================================================ */

const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const { requireProjectScope } = require('../../middlewares/role.middleware');

function buildScopeById(model, notFoundMessage) {
  return [
    async function resolveProjectId(req, res, next) {
      try {
        const record = await prisma[model].findUnique({
          where: { id: req.params.id },
          select: { projectId: true },
        });

        if (!record) {
          return next(AppError.notFound(notFoundMessage));
        }

        req.resolvedProjectId = record.projectId;
        return next();
      } catch (err) {
        return next(err);
      }
    },
    requireProjectScope((req) => req.resolvedProjectId),
  ];
}

const scopeByNcrId = buildScopeById('nonConformity', 'Non-conformity record not found');
const scopeByCorrectiveActionId = buildScopeById('correctiveAction', 'Corrective action not found');

module.exports = { scopeByNcrId, scopeByCorrectiveActionId };
