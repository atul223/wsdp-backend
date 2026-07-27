const { z } = require('zod');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const uuid = z.string().uuid();

const RISK_CATEGORIES = [
  'regulatory',
  'financial',
  'resource',
  'technical',
  'environmental',
  'safety',
  'contractual',
  'general',
];

const RISK_LEVELS = ['low', 'medium', 'high'];
const RISK_STATUSES = ['open', 'mitigated', 'closed'];
const DELAY_STATUSES = ['open', 'in_progress', 'mitigated', 'closed'];
const DELAY_CATEGORIES = [
  'regulatory',
  'materials',
  'weather',
  'land_row',
  'resource',
  'technical',
  'financial',
  'general',
];

const delayRootCauseThresholdDays = 10;

// -----------------------------------------------------------------------
// Risk Register
// -----------------------------------------------------------------------
const riskCreateSchema = z.object({
  category: z.string(),
  description: z.string().min(5),
  probability: z.string(),
  impact: z.string(),
  owner_id: uuid.optional(),
  owner_name: z.string().optional(),
  identified_date: isoDate,
  status: z.string().optional(),
});

const riskPutSchema = riskCreateSchema;

const riskPatchSchema = z
  .object({
    category: z.enum(RISK_CATEGORIES).optional(),
    description: z.string().min(5).max(2000).optional(),
    probability: z.enum(RISK_LEVELS).optional(),
    impact: z.enum(RISK_LEVELS).optional(),
    owner_id: uuid.optional(),
    owner_name: z.string().min(2).max(120).optional(),
    identified_date: isoDate.optional(),
    status: z.enum(RISK_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' })
  .refine((data) => !data.identified_date || new Date(data.identified_date) <= new Date(), {
    message: 'identified_date cannot be in the future',
    path: ['identified_date'],
  });

// -----------------------------------------------------------------------
// Delay Analysis
// -----------------------------------------------------------------------
const delayCreateSchema = z
  .object({
    work_package_id: uuid.optional().nullable(),
    reason: z.string().min(5, 'Delay item/reason must be at least 5 characters').max(255),
    category: z.enum(DELAY_CATEGORIES).optional(),
    days_delayed: z.number().int().min(0),
    root_cause: z.string().max(2000).optional(),
    mitigation_plan: z.string().max(2000).optional(),
    status: z.enum(DELAY_STATUSES).optional(),
  })
  .refine(
    (data) => data.days_delayed <= delayRootCauseThresholdDays || !!data.root_cause,
    {
      message: `root_cause is required when days_delayed exceeds ${delayRootCauseThresholdDays} days`,
      path: ['root_cause'],
    }
  );

const delayPutSchema = delayCreateSchema;

const delayPatchSchema = z
  .object({
    work_package_id: uuid.optional().nullable(),
    reason: z.string().min(5).max(255).optional(),
    category: z.enum(DELAY_CATEGORIES).optional(),
    days_delayed: z.number().int().min(0).optional(),
    root_cause: z.string().max(2000).optional(),
    mitigation_plan: z.string().max(2000).optional(),
    status: z.enum(DELAY_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

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
  riskCreateSchema,
  riskPutSchema,
  riskPatchSchema,
  delayCreateSchema,
  delayPutSchema,
  delayPatchSchema,
  validateBody,
};