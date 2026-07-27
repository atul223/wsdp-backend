const { z } = require('zod');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const uuid = z.string().uuid();

// -----------------------------------------------------------------------
// Work Package
// -----------------------------------------------------------------------
const workPackageCreateSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(200),
    planned_start: isoDate,
    planned_end: isoDate,
    actual_start: isoDate.optional().nullable(),
    actual_end: isoDate.optional().nullable(),
    weightage_pct: z.number().min(0).max(100),
  })
  .refine((data) => new Date(data.planned_end) >= new Date(data.planned_start), {
    message: 'planned_end must be on or after planned_start',
    path: ['planned_end'],
  })
  .refine(
    (data) =>
      !data.actual_start || !data.actual_end || new Date(data.actual_end) >= new Date(data.actual_start),
    { message: 'actual_end must be on or after actual_start', path: ['actual_end'] }
  );

// PUT uses the same full shape as create (full replace).
const workPackagePutSchema = workPackageCreateSchema;

const workPackagePatchSchema = z
  .object({
    name: z.string().min(3).max(200).optional(),
    planned_start: isoDate.optional(),
    planned_end: isoDate.optional(),
    actual_start: isoDate.optional().nullable(),
    actual_end: isoDate.optional().nullable(),
    weightage_pct: z.number().min(0).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

// -----------------------------------------------------------------------
// Progress Entry
// -----------------------------------------------------------------------
const progressEntryCreateSchema = z.object({
  reported_date: isoDate,
  physical_progress_pct: z.number().min(0).max(100),
  remarks: z.string().max(1000).optional(),
  attachment_ids: z.array(uuid).optional(),
});

const progressEntryPutSchema = progressEntryCreateSchema;

const progressEntryPatchSchema = z
  .object({
    physical_progress_pct: z.number().min(0).max(100).optional(),
    remarks: z.string().max(1000).optional(),
    attachment_ids: z.array(uuid).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

/** Same validateBody helper shape used by the auth module. */
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
  workPackageCreateSchema,
  workPackagePutSchema,
  workPackagePatchSchema,
  progressEntryCreateSchema,
  progressEntryPutSchema,
  progressEntryPatchSchema,
  validateBody,
};
