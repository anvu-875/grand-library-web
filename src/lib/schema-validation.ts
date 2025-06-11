import { userRoles } from '@/data-storage/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().nonempty('Password is required'),
});

export const sessionSchema = z.object({
  id: z.string(),
  role: z.enum(userRoles),
});

export const createdUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  userName: z.string().min(1, { message: 'User name is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .refine((value) => !bcrypt.truncates(value), {
      message: 'Password is too long',
    }),
});
