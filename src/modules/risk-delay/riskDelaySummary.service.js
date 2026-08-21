const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');

async function writeAuditLog({ userId, action, referenceId, ipAddress, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        module: 'risk_delay',
        referenceId,
        ipAddress,
        oldValue,
        newValue,
      },
    });
  } catch (err) {
    logger.error(`Failed to write audit log: ${err.message}`);
  }
}

function toApiShape(summary) {
  if (!summary) return null;

  return {
    project_id: summary.projectId,
    projected_slippage_days: summary.projectedSlippageDays,
    open_delay_items: summary.openDelayItems,
    mitigated_this_quarter: summary.mitigatedThisQuarter,
    on_critical_path: summary.onCriticalPath,
    updated_at: summary.updatedAt,
  };
}

async function getByProject(projectId) {
  const summary = await prisma.riskDelaySummary.findUnique({ where: { projectId } });

  return toApiShape(summary);
}

async function upsert({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) throw AppError.notFound('Project not found');

  const existing = await prisma.riskDelaySummary.findUnique({ where: { projectId } });

  const data = {
    projectedSlippageDays: payload.projected_slippage_days ?? null,
    openDelayItems: payload.open_delay_items ?? null,
    mitigatedThisQuarter: payload.mitigated_this_quarter ?? null,
    onCriticalPath: payload.on_critical_path ?? null,
  };

  const updated = await prisma.riskDelaySummary.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });

  await writeAuditLog({
    userId,
    action: existing ? 'update' : 'create',
    referenceId: updated.id,
    ipAddress,
    oldValue: existing || undefined,
    newValue: updated,
  });

  return toApiShape(updated);
}

module.exports = { getByProject, upsert };
