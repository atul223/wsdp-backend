const { z } = require('zod');
const {
  INCIDENT_TYPES,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  CHECKLIST_ITEM_STATUSES,
} = require('../../common/constants/ehs');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

function notInFuture(fieldLabel) {
  return (value) => new Date(value) <= new Date();
}

// -----------------------------------------------------------------------
// EHS Incidents
// -----------------------------------------------------------------------
const incidentCreateSchema = z
  .object({
    incident_type: z.enum(INCIDENT_TYPES),
    severity: z.enum(INCIDENT_SEVERITIES),
    incident_date: isoDate,
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  })
  .refine((data) => notInFuture()(data.incident_date), {
    message: 'incident_date cannot be in the future',
    path: ['incident_date'],
  })
  .refine((data) => data.severity !== 'critical' || data.description.length >= 20, {
    message: 'Critical incidents require a description of at least 20 characters',
    path: ['description'],
  });

const incidentPutSchema = incidentCreateSchema.and(
  z.object({ status: z.enum(INCIDENT_STATUSES).optional() })
);

const incidentPatchSchema = z
  .object({
    incident_type: z.enum(INCIDENT_TYPES).optional(),
    severity: z.enum(INCIDENT_SEVERITIES).optional(),
    incident_date: isoDate.optional(),
    description: z.string().min(10).max(2000).optional(),
    status: z.enum(INCIDENT_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' })
  .refine((data) => !data.incident_date || notInFuture()(data.incident_date), {
    message: 'incident_date cannot be in the future',
    path: ['incident_date'],
  });

// -----------------------------------------------------------------------
// EHS Inspections (with embedded checklist items on create)
// -----------------------------------------------------------------------
const checklistItemInputSchema = z
  .object({
    item_description: z.string().min(3).max(255),
    status: z.enum(CHECKLIST_ITEM_STATUSES),
    due_date: isoDate.optional().nullable(),
  })
  .refine((item) => item.status !== 'non_compliant' || !!item.due_date, {
    message: 'due_date is required when status is non_compliant',
    path: ['due_date'],
  });

const inspectionCreateSchema = z
  .object({
    inspection_date: isoDate,
    score_pct: z.number().min(0).max(100).optional(),
    remarks: z.string().max(1000).optional(),
    checklist_items: z.array(checklistItemInputSchema).optional(),
  })
  .refine((data) => notInFuture()(data.inspection_date), {
    message: 'inspection_date cannot be in the future',
    path: ['inspection_date'],
  });

const inspectionPutSchema = inspectionCreateSchema;

const inspectionPatchSchema = z
  .object({
    score_pct: z.number().min(0).max(100).optional(),
    remarks: z.string().max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

const checklistItemPatchSchema = z
  .object({
    status: z.enum(CHECKLIST_ITEM_STATUSES).optional(),
    due_date: isoDate.optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' })
  .refine((data) => data.status !== 'non_compliant' || !!data.due_date, {
    message: 'due_date is required when status is non_compliant',
    path: ['due_date'],
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
        error: { code: 'VALIDATION_ERROR', message: 'Request failed validation', details },
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = {
  incidentCreateSchema,
  incidentPutSchema,
  incidentPatchSchema,
  inspectionCreateSchema,
  inspectionPutSchema,
  inspectionPatchSchema,
  checklistItemPatchSchema,
  validateBody,
};
