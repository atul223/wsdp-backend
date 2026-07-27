const Redis = require('ioredis');
const env = require('./env');
const logger = require('../common/utils/logger');

const redis = new Redis(env.redis.url, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on('error', (err) => {
  logger.error(`Redis connection error: ${err.message}`);
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

module.exports = redis;
