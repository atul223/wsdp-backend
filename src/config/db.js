const { PrismaClient } = require('@prisma/client');
const env = require('./env');

// Single shared Prisma client instance across the app (recommended by
// Prisma docs — avoids exhausting DB connections in dev with hot reload).
const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
