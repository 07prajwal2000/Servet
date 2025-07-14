import Redis from 'ioredis';

export let redis: Redis = null!;

export async function initializeRedis() {
  redis = new Redis(process.env.REDIS_CONN!)
  const status = await redis.setex("1", 1, 1);
  if (status == "OK") console.log("Connected to redis");
}
