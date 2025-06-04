import z from 'zod';
import UserService from './user.service';
import bcrypt from 'bcryptjs';
import SessionService from './session.service';
import { Cookies } from '@/lib/type';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default class AuthService {
  private static instance: AuthService | null = null;

  private constructor() {}

  public static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  static hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          hash ? resolve(hash) : reject(new Error('Hashing failed'));
        }
      });
    });
  }

  static isPasswordTooLong(password: string) {
    return bcrypt.truncates(password);
  }

  static comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hashedPassword, (err, result) => {
        if (err) {
          reject(err);
        } else {
          result
            ? resolve(result)
            : reject(new Error('Password comparison failed'));
        }
      });
    });
  }

  async signIn(
    unsafeCredentials: z.infer<typeof signInSchema>,
    cookiesStore: Cookies
  ) {
    const { success, data } = signInSchema.safeParse(unsafeCredentials);
    if (!success) {
      throw new Error('Invalid credentials');
    }

    const user = await UserService.getInstance().getUserByEmail(data.email);
    if (!user) {
      throw new Error('User not found');
    }

    try {
      const isCorrectPassword = await AuthService.comparePasswords(
        data.password,
        user.passwordHash
      );
      if (!isCorrectPassword) {
        throw new Error('Wrong password');
      }
    } catch (error) {
      throw new Error('Password comparison failed: ' + (error as any)?.message);
    }

    await SessionService.getInstance().createUserSession(user, cookiesStore);
  }

  async logOut(cookiesStore: Cookies) {
    await SessionService.getInstance().removeUserFromSession(cookiesStore);
  }
}
