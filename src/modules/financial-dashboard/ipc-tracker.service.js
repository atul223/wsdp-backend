
const prisma = require('../../config/db');

function toDecimalOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  return value;
}

async function list(projectId) {
  return prisma.ipc.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    orderBy: [
      { ipcDate: 'asc' },
      { createdAt: 'asc' },
    ],
  });
}

async function create(projectId, payload) {
  return prisma.ipc.create({
    data: {
      projectId,
      ipc: payload.ipc,
      period: payload.period || null,
      aoaAmount: toDecimalOrNull(payload.aoa_amount),
      usdAmount: toDecimalOrNull(payload.usd_amount),
      percentage: toDecimalOrNull(payload.percentage),
      aceStatus: payload.ace_status || null,
      clientStatus: payload.client_status || null,
      ipcDate: payload.ipc_date ? new Date(payload.ipc_date) : null,
      status: payload.status || 'pending',
    },
  });
}

async function update(id, payload) {
  return prisma.ipc.update({
    where: { id },
    data: {
      ipc: payload.ipc,
      period: payload.period || null,
      aoaAmount: toDecimalOrNull(payload.aoa_amount),
      usdAmount: toDecimalOrNull(payload.usd_amount),
      percentage: toDecimalOrNull(payload.percentage),
      aceStatus: payload.ace_status || null,
      clientStatus: payload.client_status || null,
      ipcDate: payload.ipc_date ? new Date(payload.ipc_date) : null,
      status: payload.status || 'pending',
    },
  });
}

async function remove(id) {
  return prisma.ipc.update({
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