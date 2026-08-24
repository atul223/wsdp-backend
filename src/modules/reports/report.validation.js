
const { z } = require('zod');

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const reportModuleEnum = z.enum(
  [
    'overall',
    'construction_progress',
    'financial_dashboard',
    'resource_dashboard',
    'risk_delay',
    'ehs',
    'gis',
  ],
  {
    errorMap: () => ({
      message:
        'module must be one of: overall, construction_progress, financial_dashboard, resource_dashboard, risk_delay, ehs, gis',
    }),
  }
);

const reportStatusEnum = z.enum(['draft', 'generated', 'approved', 'archived'], {
  errorMap: () => ({
    message: 'status must be one of: draft, generated, approved, archived',
  }),
});

const reportCreateSchema = z
  .object({
    title: z.string().min(3, 'title must be at least 3 characters').max(200),
    period: z.string().min(2, 'period is required').max(50),
    module: reportModuleEnum.default('overall'),
    date_from: isoDate.optional().nullable(),
    date_to: isoDate.optional().nullable(),
    generated_date: isoDate,
    status: reportStatusEnum.default('draft'),
    summary: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.date_from || !data.date_to) return true;
      return new Date(data.date_from) <= new Date(data.date_to);
    },
    {
      message: 'date_from cannot be later than date_to',
      path: ['date_from'],
    }
  );

const reportPutSchema = reportCreateSchema;

const reportPatchSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    period: z.string().min(2).max(50).optional(),
    module: reportModuleEnum.optional(),
    date_from: isoDate.optional().nullable(),
    date_to: isoDate.optional().nullable(),
    generated_date: isoDate.optional(),
    status: reportStatusEnum.optional(),
    summary: z.string().max(2000).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })
  .refine(
    (data) => {
      if (!data.date_from || !data.date_to) return true;
      return new Date(data.date_from) <= new Date(data.date_to);
    },
    {
      message: 'date_from cannot be later than date_to',
      path: ['date_from'],
    }
  );

/* ------------------------------------------------------------------
   Periodic Reports — full CRUD validation
   ------------------------------------------------------------------ */

const periodicReportStatusEnum = z.enum(
  ['draft', 'pending', 'issued', 'approved', 'archived'],
  {
    errorMap: () => ({
      message: 'status must be one of: draft, pending, issued, approved, archived',
    }),
  }
);

const periodicReportCreateSchema = z.object({
  document: z.string().min(2, 'document is required').max(200),
  latest_issue: z.string().max(100).optional().nullable(),
  status: periodicReportStatusEnum.default('pending'),
});

const periodicReportUpdateSchema = z
  .object({
    document: z.string().min(2).max(200).optional(),
    latest_issue: z.string().max(100).optional().nullable(),
    status: periodicReportStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

/* ------------------------------------------------------------------
   Method Statements — full CRUD validation
   ------------------------------------------------------------------ */

const methodStatementStatusEnum = z.enum(['pending', 'approved', 'archived'], {
  errorMap: () => ({
    message: 'status must be one of: pending, approved, archived',
  }),
});

const methodStatementCreateSchema = z.object({
  method_statement: z.string().min(2, 'method_statement is required').max(200),
  date: isoDate.optional().nullable(),
  status: methodStatementStatusEnum.default('pending'),
});

const methodStatementUpdateSchema = z
  .object({
    method_statement: z.string().min(2).max(200).optional(),
    date: isoDate.optional().nullable(),
    status: methodStatementStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        issue: issue.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request failed validation',
          details,
        },
      });
    }

    req.validatedBody = result.data;
    next();
  };
}

module.exports = {
  reportCreateSchema,
  reportPutSchema,
  reportPatchSchema,
  periodicReportCreateSchema,
  periodicReportUpdateSchema,
  methodStatementCreateSchema,
  methodStatementUpdateSchema,
  validateBody,
};
