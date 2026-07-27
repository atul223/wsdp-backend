const { z } = require('zod');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const uuid = z.string().uuid();
const positiveQty = z.number().positive('Value must be greater than 0').multipleOf(0.01, 'Value may have at most 2 decimal places');

// -----------------------------------------------------------------------
// Resource
// -----------------------------------------------------------------------

const resourceTypeEnum = z.enum(['equipment', 'manpower', 'material'], {
  errorMap: () => ({ message: 'type must be one of: equipment, manpower, material' }),
});

const resourceCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  type: resourceTypeEnum,
  unit: z.string().min(1, 'unit is required').max(20),
  total_capacity: positiveQty,
  notes: z.string().max(1000).optional(),
});

// PUT uses the same full shape as create (full replace).
const resourcePutSchema = resourceCreateSchema;

const resourcePatchSchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
    type: resourceTypeEnum.optional(),
    unit: z.string().min(1).max(20).optional(),
    total_capacity: positiveQty.optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

// -----------------------------------------------------------------------
// Allocation
// -----------------------------------------------------------------------

const allocationCreateSchema = z.object({
  work_package_id: uuid.optional().nullable(),
  quantity: positiveQty,
  allocation_date: isoDate,
  remarks: z.string().max(500).optional(),
});

// PUT replaces all editable allocation fields except status — status is
// changed only via PATCH, where the transition is checked against role
// and current status inside the service layer.
const allocationPutSchema = allocationCreateSchema;

const allocationStatusEnum = z.enum(['planned', 'in_use', 'completed', 'cancelled'], {
  errorMap: () => ({ message: 'status must be one of: planned, in_use, completed, cancelled' }),
});

const allocationPatchSchema = z
  .object({
    work_package_id: uuid.optional().nullable(),
    quantity: positiveQty.optional(),
    allocation_date: isoDate.optional(),
    remarks: z.string().max(500).optional(),
    status: allocationStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

/** Same validateBody helper shape used by every other module. */
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
  resourceCreateSchema,
  resourcePutSchema,
  resourcePatchSchema,
  allocationCreateSchema,
  allocationPutSchema,
  allocationPatchSchema,
  validateBody,
};
