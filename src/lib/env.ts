import z from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().nonempty(),
  NEXT_PUBLIC_BASE_URL: z.string().nonempty(),
});

export const env = envSchema.parse(process.env);
