
const prisma = require('../../config/db');
const AppError = require('../../common/errors/AppError');
const logger = require('../../common/utils/logger');
const { parseListQuery, buildMeta } = require('../../common/utils/pagination');

const ALLOWED_SORT_FIELDS = ['title', 'period', 'module', 'generatedDate', 'createdAt'];

function toDateOrNull(value) {
  return value ? new Date(value) : null;
}

function dateToApi(value) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function toApiShape(report) {
  return {
    id: report.id,
    project_id: report.projectId,
    title: report.title,
    period: report.period,
    module: report.module,
    date_from: dateToApi(report.dateFrom),
    date_to: dateToApi(report.dateTo),
    generated_date: dateToApi(report.generatedDate),
    status: report.status,
    summary: report.summary || null,
    created_by: report.createdBy,
    created_at: report.createdAt,
    updated_at: report.updatedAt,
  };
}

async function writeAuditLog({ userId, action, referenceId, ipAddress, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        module: 'reports',
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

async function getDefaultProjectForUser(user) {
  if (user.projectIds && user.projectIds.length > 0) {
    const project = await prisma.project.findFirst({
      where: {
        id: { in: user.projectIds },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (project) {
      return {
        id: project.id,
        name: project.name,
        code: project.code,
        status: project.status,
      };
    }
  }

  const project = await prisma.project.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!project) {
    throw AppError.notFound('No project found. Please seed or create a project first.');
  }

  return {
    id: project.id,
    name: project.name,
    code: project.code,
    status: project.status,
  };
}

async function listByProject(projectId, req) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const { page, limit, skip, orderBy } = parseListQuery(req, {
    allowedSortFields: ALLOWED_SORT_FIELDS,
    defaultSortField: 'generatedDate',
  });

  const where = {
    projectId,
    deletedAt: null,
  };

  if (req.query.module) where.module = req.query.module;
  if (req.query.status) where.status = req.query.status;

  const [rows, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return {
    data: rows.map(toApiShape),
    meta: buildMeta({ page, limit, total }),
  };
}

async function getById(id) {
  const report = await prisma.report.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!report) {
    throw AppError.notFound('Report not found');
  }

  return toApiShape(report);
}

async function create({ projectId, payload, userId, ipAddress }) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const report = await prisma.report.create({
    data: {
      projectId,
      title: payload.title,
      period: payload.period,
      module: payload.module || 'overall',
      dateFrom: toDateOrNull(payload.date_from),
      dateTo: toDateOrNull(payload.date_to),
      generatedDate: new Date(payload.generated_date),
      status: payload.status || 'draft',
      summary: payload.summary || null,
      createdBy: userId,
    },
  });

  await writeAuditLog({
    userId,
    action: 'create',
    referenceId: report.id,
    ipAddress,
    newValue: report,
  });

  return toApiShape(report);
}

async function fullUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.report.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw AppError.notFound('Report not found');
  }

  const updated = await prisma.report.update({
    where: { id },
    data: {
      title: payload.title,
      period: payload.period,
      module: payload.module || 'overall',
      dateFrom: toDateOrNull(payload.date_from),
      dateTo: toDateOrNull(payload.date_to),
      generatedDate: new Date(payload.generated_date),
      status: payload.status || 'draft',
      summary: payload.summary || null,
    },
  });

  await writeAuditLog({
    userId,
    action: 'update',
    referenceId: id,
    ipAddress,
    oldValue: existing,
    newValue: updated,
  });

  return toApiShape(updated);
}

async function partialUpdate({ id, payload, userId, ipAddress }) {
  const existing = await prisma.report.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw AppError.notFound('Report not found');
  }

  const data = {};

  if (payload.title !== undefined) data.title = payload.title;
  if (payload.period !== undefined) data.period = payload.period;
  if (payload.module !== undefined) data.module = payload.module;
  if (payload.date_from !== undefined) data.dateFrom = toDateOrNull(payload.date_from);
  if (payload.date_to !== undefined) data.dateTo = toDateOrNull(payload.date_to);
  if (payload.generated_date !== undefined) data.generatedDate = new Date(payload.generated_date);
  if (payload.status !== undefined) data.status = payload.status;
  if (payload.summary !== undefined) data.summary = payload.summary || null;

  const updated = await prisma.report.update({
    where: { id },
    data,
  });

  await writeAuditLog({
    userId,
    action: 'update',
    referenceId: id,
    ipAddress,
    oldValue: existing,
    newValue: updated,
  });

  return toApiShape(updated);
}

async function remove({ id, userId, ipAddress }) {
  const existing = await prisma.report.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw AppError.notFound('Report not found');
  }

  await prisma.report.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  await writeAuditLog({
    userId,
    action: 'delete',
    referenceId: id,
    ipAddress,
    oldValue: existing,
  });
}

async function getProjectIdForReport(reportId) {
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      deletedAt: null,
    },
    select: {
      projectId: true,
    },
  });

  return report ? report.projectId : null;
}

function buildCsv(report) {
  const headers = [
    'Title',
    'Period',
    'Module',
    'Date From',
    'Date To',
    'Generated Date',
    'Status',
    'Summary',
  ];

  const row = [
    report.title,
    report.period,
    report.module,
    report.date_from || '',
    report.date_to || '',
    report.generated_date,
    report.status,
    report.summary || '',
  ];

  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;

  return `${headers.map(escape).join(',')}\n${row.map(escape).join(',')}\n`;
}

function buildSimplePdf(report) {
  const lines = [
    'Water Supply Distribution Project',
    report.title,
    '',
    `Period: ${report.period}`,
    `Module: ${report.module}`,
    `Date Range: ${report.date_from || '-'} to ${report.date_to || '-'}`,
    `Generated Date: ${report.generated_date}`,
    `Status: ${report.status}`,
    '',
    'Summary:',
    report.summary || '-',
  ];

  const bodyText = lines.join('\\n').replace(/[()]/g, '');

  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${bodyText.length + 80} >>
stream
BT
/F1 12 Tf
50 740 Td
14 TL
(${bodyText.replace(/\n/g, ') Tj T* (')}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000059 00000 n 
0000000116 00000 n 
0000000263 00000 n 
0000000000 00000 n 
trailer
<< /Root 1 0 R /Size 6 >>
startxref
0
%%EOF`;
}

function buildPowerPointHtml(report) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${report.title}</title>
</head>
<body>
<section>
<h1>${report.title}</h1>
<h2>${report.period}</h2>
<p><strong>Module:</strong> ${report.module}</p>
<p><strong>Date Range:</strong> ${report.date_from || '-'} to ${report.date_to || '-'}</p>
<p><strong>Generated Date:</strong> ${report.generated_date}</p>
<p><strong>Status:</strong> ${report.status}</p>
<p><strong>Summary:</strong> ${report.summary || '-'}</p>
</section>
</body>
</html>`;
}

async function exportReport({ id, format }) {
  const report = await getById(id);
  const normalizedFormat = String(format || 'pdf').toLowerCase();

  let filename;
  let mimeType;
  let content;

  if (normalizedFormat === 'excel') {
    filename = `${report.title.replace(/[^\w.-]+/g, '_')}.csv`;
    mimeType = 'text/csv';
    content = buildCsv(report);
  } else if (normalizedFormat === 'powerpoint') {
    filename = `${report.title.replace(/[^\w.-]+/g, '_')}.ppt`;
    mimeType = 'application/vnd.ms-powerpoint';
    content = buildPowerPointHtml(report);
  } else {
    filename = `${report.title.replace(/[^\w.-]+/g, '_')}.pdf`;
    mimeType = 'application/pdf';
    content = buildSimplePdf(report);
  }

  return {
    filename,
    mime_type: mimeType,
    content_base64: Buffer.from(content, 'utf8').toString('base64'),
  };
}

module.exports = {
  getDefaultProjectForUser,
  listByProject,
  getById,
  create,
  fullUpdate,
  partialUpdate,
  remove,
  getProjectIdForReport,
  exportReport,
};