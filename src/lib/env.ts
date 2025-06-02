import z from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().nonempty(),
  REDIS_URL: z.string().nonempty(),
  REDIS_TOKEN: z.string().nonempty(),
});

export const env = envSchema.parse(process.env);
