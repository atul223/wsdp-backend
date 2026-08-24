const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const { GLOBAL_SCOPE_ROLES } = require('../../common/constants/roles');

function toNumber(value) {
  if (value === null || value === undefined) return value;
  return Number(value);
}

function round2(n) {
  return Number(Number(n || 0).toFixed(2));
}

function normalizePipelineSection(section) {
  return {
    id: section.id,
    projectId: section.projectId,
    zone: section.zone,
    chainageFrom: section.chainageFrom,
    chainageTo: section.chainageTo,
    diameter: section.diameter,
    lengthKm: toNumber(section.lengthKm),
    layingPct: toNumber(section.layingPct),
    testingPct: toNumber(section.testingPct),
    status: section.status,
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
  };
}

function normalizeHouseCluster(cluster) {
  return {
    id: cluster.id,
    projectId: cluster.projectId,
    clusterName: cluster.clusterName,
    planned: cluster.planned,
    completed: cluster.completed,
    inProgress: cluster.inProgress,
    remaining: cluster.remaining,
    createdAt: cluster.createdAt,
    updatedAt: cluster.updatedAt,
  };
}

function normalizeTestingActivity(activity) {
  return {
    id: activity.id,
    projectId: activity.projectId,
    activityName: activity.activityName,
    plannedValue: toNumber(activity.plannedValue),
    actualValue: toNumber(activity.actualValue),
    unit: activity.unit,
    status: activity.status,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
  };
}

function normalizeValveSummary(summary) {
  if (!summary) return null;

  return {
    id: summary.id,
    projectId: summary.projectId,
    planned: summary.planned,
    completed: summary.completed,
    inProgress: summary.inProgress,
    notStarted: summary.notStarted,
    updatedAt: summary.updatedAt,
  };
}

function normalizeBridgeCrossing(crossing) {
  return {
    id: crossing.id,
    projectId: crossing.projectId,
    crossingName: crossing.crossingName,
    crossingType: crossing.crossingType,
    method: crossing.method,
    status: crossing.status,
    remarks: crossing.remarks,
    createdAt: crossing.createdAt,
    updatedAt: crossing.updatedAt,
  };
}

/* =========================================================
   NEW: Area-wise / Pipe Diameter Wise / Activity Wise Progress
   ========================================================= */

function normalizeAreaWiseProgress(row) {
  const designReport = toNumber(row.designReport);
  const contract = toNumber(row.contract);
  const executed = toNumber(row.executed);

  return {
    id: row.id,
    projectId: row.projectId,
    area: row.area,
    designReport,
    contract,
    executed,
    balance: round2(contract - executed),
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function normalizePipeDiameterProgress(row) {
  const proposedLength = toNumber(row.proposedLength);
  const executed = toNumber(row.executed);

  return {
    id: row.id,
    projectId: row.projectId,
    diameter: row.diameter,
    proposedLength,
    executed,
    balance: round2(proposedLength - executed),
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function normalizeActivityWiseProgress(row) {
  return {
    id: row.id,
    projectId: row.projectId,
    activity: row.activity,
    previousMonth: row.previousMonth === null ? null : toNumber(row.previousMonth),
    currentMonth: row.currentMonth === null ? null : toNumber(row.currentMonth),
    cumulative: row.cumulative === null ? null : toNumber(row.cumulative),
    totalPercent: row.totalPercent === null ? null : toNumber(row.totalPercent),
    unit: row.unit,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function normalizePipelineSummary(row) {
  if (!row) return null;

  const totalLengthKm = toNumber(row.totalLengthKm);
  const laidKm = toNumber(row.laidKm);
  const hydroTestedKm = toNumber(row.hydroTestedKm);

  return {
    id: row.id,
    projectId: row.projectId,
    totalLengthKm,
    laidKm,
    hydroTestedKm,
    remainingKm: round2(totalLengthKm - laidKm),
    updatedAt: row.updatedAt,
  };
}

function normalizeHouseSummary(row) {
  if (!row) return null;

  return {
    id: row.id,
    projectId: row.projectId,
    completed: row.completed,
    inProgress: row.inProgress,
    remaining: row.remaining,
    updatedAt: row.updatedAt,
  };
}

function canAccessProject(user, projectId) {
  if (!user) return false;
  if (GLOBAL_SCOPE_ROLES.includes(user.role)) return true;
  return Array.isArray(user.projectIds) && user.projectIds.includes(projectId);
}

async function getDefaultProject(user) {
  let project = null;

  if (GLOBAL_SCOPE_ROLES.includes(user.role)) {
    project = await prisma.project.findFirst({
      where: {
        status: {
          not: 'deleted',
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  } else {
    const projectIds = user.projectIds || [];

    if (!projectIds.length) {
      throw AppError.forbidden('No project is assigned to this user');
    }

    project = await prisma.project.findFirst({
      where: {
        id: {
          in: projectIds,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  if (!project) {
    throw AppError.notFound('No project found');
  }

  return {
    id: project.id,
    name: project.name,
    code: project.code,
    status: project.status,
  };
}

async function getDashboard(projectId, user) {
  if (!projectId) {
    throw AppError.badRequest('Project id is required');
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw AppError.notFound('Project not found');
  }

  if (!canAccessProject(user, projectId)) {
    throw AppError.forbidden('You do not have access to this project');
  }

  const [
    pipelineSections,
    houseClusters,
    testing,
    valve,
    crossings,
    areaProgress,
    pipeDiameterProgress,
    activityProgress,
    pipelineSummary,
    houseSummary,
  ] = await Promise.all([
    prisma.pipelineSection.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    }),

    prisma.houseConnectionCluster.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    }),

    prisma.testingActivity.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    }),

    prisma.valveChamberSummary.findUnique({
      where: { projectId },
    }),

    prisma.bridgeCrossing.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    }),

    prisma.areaWiseProgress.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    }),

    prisma.pipeDiameterProgress.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    }),

    prisma.activityWiseProgress.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    }),

    prisma.pipelineProgressSummary.findUnique({
      where: { projectId },
    }),

    prisma.houseConnectionSummary.findUnique({
      where: { projectId },
    }),
  ]);

  const normalizedPipelineSections = pipelineSections.map(normalizePipelineSection);
  const normalizedHouseClusters = houseClusters.map(normalizeHouseCluster);
  const normalizedTesting = testing.map(normalizeTestingActivity);
  const normalizedValve = normalizeValveSummary(valve);
  const normalizedCrossings = crossings.map(normalizeBridgeCrossing);
  const normalizedAreaProgress = areaProgress.map(normalizeAreaWiseProgress);
  const normalizedPipeDiameterProgress = pipeDiameterProgress.map(normalizePipeDiameterProgress);
  const normalizedActivityProgress = activityProgress.map(normalizeActivityWiseProgress);
  const normalizedPipelineSummary = normalizePipelineSummary(pipelineSummary);
  const normalizedHouseSummary = normalizeHouseSummary(houseSummary);

  const totalLength = normalizedPipelineSections.reduce(
    (sum, x) => sum + Number(x.lengthKm || 0),
    0
  );

  const laid = normalizedPipelineSections.reduce(
    (sum, x) => sum + ((Number(x.lengthKm || 0) * Number(x.layingPct || 0)) / 100),
    0
  );

  const tested = normalizedPipelineSections.reduce(
    (sum, x) => sum + ((Number(x.lengthKm || 0) * Number(x.testingPct || 0)) / 100),
    0
  );

  const houseTotals = normalizedHouseClusters.reduce(
    (acc, x) => {
      acc.planned += Number(x.planned || 0);
      acc.completed += Number(x.completed || 0);
      acc.inProgress += Number(x.inProgress || 0);
      acc.remaining += Number(x.remaining || 0);
      return acc;
    },
    {
      planned: 0,
      completed: 0,
      inProgress: 0,
      remaining: 0,
    }
  );

  return {
    project: {
      id: project.id,
      name: project.name,
      code: project.code,
      status: project.status,
    },

    pipeline: {
      total_length: Number(totalLength.toFixed(2)),
      laid: Number(laid.toFixed(2)),
      tested: Number(tested.toFixed(2)),
      remaining: Number((totalLength - laid).toFixed(2)),
    },

    house_connections: houseTotals,

    pipeline_sections: normalizedPipelineSections,
    house_clusters: normalizedHouseClusters,
    testing: normalizedTesting,
    valve: normalizedValve,
    crossings: normalizedCrossings,

    // Construction Progress module tables
    area_progress: normalizedAreaProgress,
    pipe_diameter_progress: normalizedPipeDiameterProgress,
    activity_progress: normalizedActivityProgress,

    // Construction Progress KPI card overrides
    pipeline_summary: normalizedPipelineSummary,
    house_summary: normalizedHouseSummary,
  };
}

async function createPipelineSection(data) {
  return normalizePipelineSection(
    await prisma.pipelineSection.create({
      data: {
        projectId: data.projectId,
        zone: data.zone,
        chainageFrom: data.chainageFrom,
        chainageTo: data.chainageTo,
        diameter: data.diameter,
        lengthKm: data.lengthKm,
        layingPct: data.layingPct,
        testingPct: data.testingPct,
        status: data.status,
      },
    })
  );
}

async function updatePipelineSection(id, data) {
  return normalizePipelineSection(
    await prisma.pipelineSection.update({
      where: { id },
      data: {
        zone: data.zone,
        chainageFrom: data.chainageFrom,
        chainageTo: data.chainageTo,
        diameter: data.diameter,
        lengthKm: data.lengthKm,
        layingPct: data.layingPct,
        testingPct: data.testingPct,
        status: data.status,
      },
    })
  );
}

async function deletePipelineSection(id) {
  return prisma.pipelineSection.delete({
    where: { id },
  });
}

async function createHouseCluster(data) {
  return normalizeHouseCluster(
    await prisma.houseConnectionCluster.create({
      data: {
        projectId: data.projectId,
        clusterName: data.clusterName,
        planned: data.planned,
        completed: data.completed,
        inProgress: data.inProgress,
        remaining: data.remaining,
      },
    })
  );
}

async function updateHouseCluster(id, data) {
  return normalizeHouseCluster(
    await prisma.houseConnectionCluster.update({
      where: { id },
      data: {
        clusterName: data.clusterName,
        planned: data.planned,
        completed: data.completed,
        inProgress: data.inProgress,
        remaining: data.remaining,
      },
    })
  );
}

async function deleteHouseCluster(id) {
  return prisma.houseConnectionCluster.delete({
    where: { id },
  });
}

async function createTestingActivity(data) {
  return normalizeTestingActivity(
    await prisma.testingActivity.create({
      data: {
        projectId: data.projectId,
        activityName: data.activityName,
        plannedValue: data.plannedValue,
        actualValue: data.actualValue,
        unit: data.unit,
        status: data.status,
      },
    })
  );
}

async function updateTestingActivity(id, data) {
  return normalizeTestingActivity(
    await prisma.testingActivity.update({
      where: { id },
      data: {
        activityName: data.activityName,
        plannedValue: data.plannedValue,
        actualValue: data.actualValue,
        unit: data.unit,
        status: data.status,
      },
    })
  );
}

async function deleteTestingActivity(id) {
  return prisma.testingActivity.delete({
    where: { id },
  });
}

async function createBridgeCrossing(data) {
  return normalizeBridgeCrossing(
    await prisma.bridgeCrossing.create({
      data: {
        projectId: data.projectId,
        crossingName: data.crossingName,
        crossingType: data.crossingType,
        method: data.method,
        status: data.status,
        remarks: data.remarks || null,
      },
    })
  );
}

async function updateBridgeCrossing(id, data) {
  return normalizeBridgeCrossing(
    await prisma.bridgeCrossing.update({
      where: { id },
      data: {
        crossingName: data.crossingName,
        crossingType: data.crossingType,
        method: data.method,
        status: data.status,
        remarks: data.remarks || null,
      },
    })
  );
}

async function deleteBridgeCrossing(id) {
  return prisma.bridgeCrossing.delete({
    where: { id },
  });
}

async function updateValveSummary(projectId, data) {
  return normalizeValveSummary(
    await prisma.valveChamberSummary.upsert({
      where: {
        projectId,
      },
      create: {
        projectId,
        planned: data.planned,
        completed: data.completed,
        inProgress: data.inProgress,
        notStarted: data.notStarted,
      },
      update: {
        planned: data.planned,
        completed: data.completed,
        inProgress: data.inProgress,
        notStarted: data.notStarted,
      },
    })
  );
}

/* =========================================================
   NEW: Area-wise Progress CRUD
   ========================================================= */

async function createAreaProgress(data) {
  return normalizeAreaWiseProgress(
    await prisma.areaWiseProgress.create({
      data: {
        projectId: data.projectId,
        area: data.area,
        designReport: data.designReport,
        contract: data.contract,
        executed: data.executed,
        sortOrder: data.sortOrder || 0,
      },
    })
  );
}

async function updateAreaProgress(id, data) {
  return normalizeAreaWiseProgress(
    await prisma.areaWiseProgress.update({
      where: { id },
      data: {
        area: data.area,
        designReport: data.designReport,
        contract: data.contract,
        executed: data.executed,
      },
    })
  );
}

async function deleteAreaProgress(id) {
  return prisma.areaWiseProgress.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/* =========================================================
   NEW: Pipe Diameter Wise Progress CRUD
   ========================================================= */

async function createPipeDiameterProgress(data) {
  return normalizePipeDiameterProgress(
    await prisma.pipeDiameterProgress.create({
      data: {
        projectId: data.projectId,
        diameter: data.diameter,
        proposedLength: data.proposedLength,
        executed: data.executed,
        sortOrder: data.sortOrder || 0,
      },
    })
  );
}

async function updatePipeDiameterProgress(id, data) {
  return normalizePipeDiameterProgress(
    await prisma.pipeDiameterProgress.update({
      where: { id },
      data: {
        diameter: data.diameter,
        proposedLength: data.proposedLength,
        executed: data.executed,
      },
    })
  );
}

async function deletePipeDiameterProgress(id) {
  return prisma.pipeDiameterProgress.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/* =========================================================
   NEW: Activity Wise Progress CRUD
   ========================================================= */

async function createActivityProgress(data) {
  return normalizeActivityWiseProgress(
    await prisma.activityWiseProgress.create({
      data: {
        projectId: data.projectId,
        activity: data.activity,
        previousMonth: data.previousMonth,
        currentMonth: data.currentMonth,
        cumulative: data.cumulative,
        totalPercent: data.totalPercent,
        unit: data.unit || null,
        sortOrder: data.sortOrder || 0,
      },
    })
  );
}

async function updateActivityProgress(id, data) {
  return normalizeActivityWiseProgress(
    await prisma.activityWiseProgress.update({
      where: { id },
      data: {
        activity: data.activity,
        previousMonth: data.previousMonth,
        currentMonth: data.currentMonth,
        cumulative: data.cumulative,
        totalPercent: data.totalPercent,
        unit: data.unit || null,
      },
    })
  );
}

async function deleteActivityProgress(id) {
  return prisma.activityWiseProgress.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/* =========================================================
   NEW: Pipeline / House Connection KPI-card summary overrides
   ========================================================= */

async function updatePipelineSummary(projectId, data) {
  return normalizePipelineSummary(
    await prisma.pipelineProgressSummary.upsert({
      where: { projectId },
      create: {
        projectId,
        totalLengthKm: data.totalLengthKm,
        laidKm: data.laidKm,
        hydroTestedKm: data.hydroTestedKm,
      },
      update: {
        totalLengthKm: data.totalLengthKm,
        laidKm: data.laidKm,
        hydroTestedKm: data.hydroTestedKm,
      },
    })
  );
}

async function updateHouseSummary(projectId, data) {
  return normalizeHouseSummary(
    await prisma.houseConnectionSummary.upsert({
      where: { projectId },
      create: {
        projectId,
        completed: data.completed,
        inProgress: data.inProgress,
        remaining: data.remaining,
      },
      update: {
        completed: data.completed,
        inProgress: data.inProgress,
        remaining: data.remaining,
      },
    })
  );
}

module.exports = {
  getDefaultProject,
  getDashboard,

  createPipelineSection,
  updatePipelineSection,
  deletePipelineSection,

  createHouseCluster,
  updateHouseCluster,
  deleteHouseCluster,

  createTestingActivity,
  updateTestingActivity,
  deleteTestingActivity,

  createBridgeCrossing,
  updateBridgeCrossing,
  deleteBridgeCrossing,

  updateValveSummary,

  createAreaProgress,
  updateAreaProgress,
  deleteAreaProgress,

  createPipeDiameterProgress,
  updatePipeDiameterProgress,
  deletePipeDiameterProgress,

  createActivityProgress,
  updateActivityProgress,
  deleteActivityProgress,

  updatePipelineSummary,
  updateHouseSummary,
};
