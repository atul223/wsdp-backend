/**
 * Standard response envelope used across every endpoint, matching the
 * shape defined in the architecture and API design documents:
 *   { success, data, message, meta }
 *   { success: false, error: { code, message, details } }
 */

function success(res, { data = null, message = '', meta = undefined, status = 200 } = {}) {
  const body = { success: true, data, message };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

function created(res, args = {}) {
  return success(res, { ...args, status: 201 });
}

function noContent(res) {
  return res.status(204).send();
}

function error(res, { status = 500, code = 'INTERNAL_ERROR', message = 'Something went wrong', details = undefined }) {
  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  return res.status(status).json(body);
}

module.exports = { success, created, noContent, error };
