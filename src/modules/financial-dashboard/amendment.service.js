
const prisma = require('../../config/db');

async function list(projectId) {
  return prisma.amendment.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    orderBy: [
      { amendmentDate: 'asc' },
      { createdAt: 'asc' },
    ],
  });
}

async function create(projectId, payload) {
  return prisma.amendment.create({
    data: {
      projectId,
      amendment: payload.amendment,
      amendmentDate: payload.amendment_date ? new Date(payload.amendment_date) : null,
      subject: payload.subject || null,
      scope: payload.scope || null,
      status: payload.status || 'pending',
    },
  });
}

async function update(id, payload) {
  return prisma.amendment.update({
    where: { id },
    data: {
      amendment: payload.amendment,
      amendmentDate: payload.amendment_date ? new Date(payload.amendment_date) : null,
      subject: payload.subject || null,
      scope: payload.scope || null,
      status: payload.status || 'pending',
    },
  });
}

async function remove(id) {
  return prisma.amendment.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

module.exports = {
  list,
  create,
  update,
  remove,
};