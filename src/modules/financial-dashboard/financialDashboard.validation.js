const { z } = require('zod');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const uuid = z.string().uuid();
const currency = z.string().length(3, 'Currency must be a 3-letter ISO code (e.g. INR, USD)');
const money = z.number().positive('Amount must be greater than 0').multipleOf(0.01, 'Amount may have at most 2 decimal places');

// -----------------------------------------------------------------------
// Budget
// -----------------------------------------------------------------------

const budgetCreateSchema = z.object({
  category: z.string().min(2, 'Category must be at least 2 characters').max(100),
  fiscal_year: z.number().int().min(2000).max(2100),
  allocated_amount: money,
  currency: currency.optional().default('INR'),
  notes: z.string().max(1000).optional(),
});

// PUT uses the same full shape as create (full replace).
const budgetPutSchema = budgetCreateSchema;

const budgetPatchSchema = z
  .object({
    category: z.string().min(2).max(100).optional(),
    fiscal_year: z.number().int().min(2000).max(2100).optional(),
    allocated_amount: money.optional(),
    currency: currency.optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

// -----------------------------------------------------------------------
// Invoice
// -----------------------------------------------------------------------

const invoiceCreateSchema = z
  .object({
    invoice_number: z.string().min(1, 'invoice_number is required').max(50),
    vendor_name: z.string().min(2, 'vendor_name must be at least 2 characters').max(200),
    amount: money,
    invoice_date: isoDate,
    due_date: isoDate.optional().nullable(),
    attachment_ids: z.array(uuid).optional(),
  })
  .refine((data) => !data.due_date || new Date(data.due_date) >= new Date(data.invoice_date), {
    message: 'due_date must be on or after invoice_date',
    path: ['due_date'],
  });

// PUT replaces all editable invoice fields except status — status is
// changed only via PATCH, where the transition is checked against role
// and current status inside the service layer.
const invoicePutSchema = invoiceCreateSchema;

const invoiceStatusEnum = z.enum(['pending', 'approved', 'paid', 'rejected'], {
  errorMap: () => ({ message: 'status must be one of: pending, approved, paid, rejected' }),
});

const invoicePatchSchema = z
  .object({
    vendor_name: z.string().min(2).max(200).optional(),
    amount: money.optional(),
    invoice_date: isoDate.optional(),
    due_date: isoDate.optional().nullable(),
    attachment_ids: z.array(uuid).optional(),
    status: invoiceStatusEnum.optional(),
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
  budgetCreateSchema,
  budgetPutSchema,
  budgetPatchSchema,
  invoiceCreateSchema,
  invoicePutSchema,
  invoicePatchSchema,
  validateBody,
};
