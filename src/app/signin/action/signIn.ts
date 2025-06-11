'use server';

import { ErrorObj } from '@/lib/serviceReturn';
import AuthService from '@/service/auth.service';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signInAction(
  _formState: ErrorObj<Record<string, any>> | undefined,
  formData: FormData
) {
  const email = formData.get('email')?.toString() ?? '';
  const password = formData.get('password')?.toString() ?? '';
  const cookiesStore = await cookies();

  const res = await AuthService.getInstance().signIn(
    { email, password },
    cookiesStore
  );

  console.log(JSON.stringify(res));

  if (res.success || !res.error) {
    redirect('/');
  }

  return res.error;
}
