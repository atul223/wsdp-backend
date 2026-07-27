const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');
const logger = require('./common/utils/logger');

async function start() {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL via Prisma');

    const server = app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port} [${env.nodeEnv}]`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

start();
