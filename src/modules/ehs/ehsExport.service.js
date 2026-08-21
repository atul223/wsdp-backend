const prisma = require('../../config/db');
const complianceService = require('./ehsCompliance.service');
const incidentSummaryService = require('./ehsIncidentSummary.service');
const nonConformitySummaryService = require('./ehsNonConformitySummary.service');
const resourceConsumptionService = require('./ehsResourceConsumption.service');

/** Consolidates every EHS Dashboard data source into a single payload —
 * used by the frontend Export button to render the PDF, and reusable
 * later for a server-rendered export if that's ever preferred over the
 * current client-side (jsPDF + html2canvas) approach. */
async function getExportSnapshot(projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, name: true, code: true } });

  const [compliance, incidentSummary, nonConformitySummary, resourceConsumption, recentIncidents] = await Promise.all([
    complianceService.getByProject(projectId),
    incidentSummaryService.listByProject(projectId),
    nonConformitySummaryService.listByProject(projectId),
    resourceConsumptionService.listByProject(projectId),
    prisma.ehsIncident.findMany({
      where: { projectId },
      orderBy: { incidentDate: 'desc' },
      take: 10,
    }),
  ]);

  return {
    project,
    generated_at: new Date().toISOString(),
    compliance_summary: compliance,
    incident_summary: incidentSummary,
    nonconformity_summary: nonConformitySummary,
    resource_consumption: resourceConsumption,
    recent_incidents: recentIncidents.map((i) => ({
      incident_type: i.incidentType,
      severity: i.severity,
      incident_date: i.incidentDate.toISOString().slice(0, 10),
      description: i.description,
      status: i.status,
    })),
  };
}

module.exports = { getExportSnapshot };
