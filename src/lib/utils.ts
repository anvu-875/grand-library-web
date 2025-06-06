import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { faker } from '@faker-js/faker';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFakeUserName = () => faker.internet.username();

export function isPasswordTooLong(password: string): boolean {
  const encoder = new TextEncoder();
  const byteLength = encoder.encode(password).length;
  return byteLength > 72;
}
