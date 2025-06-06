'use server';

import AuthService from '@/service/auth.service';
import { cookies } from 'next/headers';

export async function signInAction(formData: FormData) {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const cookiesStore = await cookies();

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    await AuthService.getInstance().signIn({ email, password }, cookiesStore);
  } catch (error) {
    console.error(`Sign-in error.
message: ${(error as Error).message}`);
  }
}
