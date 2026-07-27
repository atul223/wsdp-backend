/**
 * Parses common list-endpoint query params: page, limit, sort_by, order.
 * Shared across modules so every GET-list endpoint behaves consistently.
 */
function parseListQuery(req, { allowedSortFields = [], defaultSortField = 'createdAt' } = {}) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  let sortBy = req.query.sort_by;
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = defaultSortField;
  }

  const order = req.query.order === 'desc' ? 'desc' : 'asc';

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    orderBy: { [sortBy]: order },
  };
}

function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    total_pages: Math.max(Math.ceil(total / limit), 1),
  };
}

module.exports = { parseListQuery, buildMeta };
