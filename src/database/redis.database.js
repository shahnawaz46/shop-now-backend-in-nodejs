import redis from 'redis';

export const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('connect', () => {
  console.log('Redis Connected');
});

redisClient.on('error', (err) => {
  console.log('Redis Connection Error:', err);
});

redisClient.on('end', () => {
  console.log('Redis Connection Closed.');
});

const redisConnection = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.log('Redis Connection Error:', error);
    redisClient.quit();
  }
};

export default redisConnection;
