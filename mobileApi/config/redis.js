const redis = require('redis');
//Create Redis client on Redis port
const redisClient = redis.createClient(6379, 'redis-live.qwkazw.ng.0001.mes1.cache.amazonaws.com', {
        no_ready_check: true
});

module.exports = redisClient;