/* ============================================================
   extraValidation.js
   Self-contained zod validation schemas + validateBody middleware
   for the new Non-Conformity, Corrective Action and Risk-Delay
   Summary modules. Kept separate from riskDelay.validation.js so it
   does not require changes to that existing file.
   ============================================================ */

const { z } = require('zod');
const AppError = require('../../common/errors/AppError');

function validateBody(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        AppError.unprocessable(
          result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
        )
      );
    }

    req.validatedBody = result.data;
    return next();
  };
}

const ncrStatusEnum = z.enum(['open', 'action_plan_requested', 'pending', 'closed']);
const actionStatusEnum = z.enum(['pending', 'in_progress', 'completed']);

const ncrCreateSchema = z.object({
  description: z.string().min(5),
  owner: z.string().min(1),
  status: ncrStatusEnum.optional(),
});

const ncrPatchSchema = z.object({
  description: z.string().min(5).optional(),
  owner: z.string().min(1).optional(),
  status: ncrStatusEnum.optional(),
});

const correctiveActionCreateSchema = z.object({
  action: z.string().min(5),
  owner: z.string().min(1),
  status: actionStatusEnum.optional(),
});

const correctiveActionPatchSchema = z.object({
  action: z.string().min(5).optional(),
  owner: z.string().min(1).optional(),
  status: actionStatusEnum.optional(),
});

const nullableNonNegativeInt = z.number().int().min(0).nullable().optional();

const summaryPutSchema = z.object({
  projected_slippage_days: nullableNonNegativeInt,
  open_delay_items: nullableNonNegativeInt,
  mitigated_this_quarter: nullableNonNegativeInt,
  on_critical_path: nullableNonNegativeInt,
});

module.exports = {
  validateBody,
  ncrCreateSchema,
  ncrPatchSchema,
  correctiveActionCreateSchema,
  correctiveActionPatchSchema,
  summaryPutSchema,
};
