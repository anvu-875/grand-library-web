import { env } from '@/lib/env';
import { Redis } from '@upstash/redis';

const redisClient = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_TOKEN,
});

export default redisClient;
