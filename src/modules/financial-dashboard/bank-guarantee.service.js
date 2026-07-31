
const prisma = require('../../config/db');

async function list(projectId) {
  return prisma.bankGuarantee.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    orderBy: [
      { validUntil: 'asc' },
      { createdAt: 'asc' },
    ],
  });
}

async function create(projectId, payload) {
  return prisma.bankGuarantee.create({
    data: {
      projectId,
      guarantee: payload.guarantee,
      bank: payload.bank,
      usdAmount: payload.usd_amount,
      validUntil: payload.valid_until ? new Date(payload.valid_until) : null,
      status: payload.status || 'valid',
    },
  });
}

async function update(id, payload) {
  return prisma.bankGuarantee.update({
    where: { id },
    data: {
      guarantee: payload.guarantee,
      bank: payload.bank,
      usdAmount: payload.usd_amount,
      validUntil: payload.valid_until ? new Date(payload.valid_until) : null,
      status: payload.status || 'valid',
    },
  });
}

async function remove(id) {
  return prisma.bankGuarantee.update({
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