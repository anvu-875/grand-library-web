import z from 'zod';
import UserService from './user.service';
import bcrypt from 'bcryptjs';
import SessionService from './session.service';
import { Cookies } from '@/lib/type';
import {
  createError,
  createServiceReturn,
  ErrorCode,
  ServiceReturn,
} from '@/lib/serviceReturn';
import { UserRole } from '@/data-storage/schema';

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().nonempty('Password is required'),
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
        console.log(err, result);
        if (err) {
          reject(err);
        } else {
          typeof result === 'boolean'
            ? resolve(result)
            : reject(new Error('Password comparison failed'));
        }
      });
    });
  }

  async signIn(
    unsafeCredentials: z.infer<typeof signInSchema>,
    cookiesStore: Cookies
  ): Promise<
    ServiceReturn<{
      id: string;
      email: string;
      userName: string;
      role: UserRole;
    }>
  > {
    const { success, error, data } = signInSchema.safeParse(unsafeCredentials);
    if (!success) {
      const errorArr: ReturnType<typeof createError>[] = [];
      if (error.formErrors.fieldErrors.email) {
        errorArr.push(
          createError({
            message: error.formErrors.fieldErrors.email,
            code: ErrorCode.UNPROCESSABLE_ENTITY,
          })
        );
      }
      if (error.formErrors.fieldErrors.password) {
        errorArr.push(
          createError({
            message: error.formErrors.fieldErrors.password,
            code: ErrorCode.UNPROCESSABLE_ENTITY,
          })
        );
      }
      return createServiceReturn({
        error: errorArr,
      });
    }

    const user = await UserService.getInstance().getUserByEmail(data.email);
    if (!user) {
      return createServiceReturn({
        error: createError({
          message: 'User not found',
          code: ErrorCode.UNAUTHORIZED,
        }),
      });
    }

    try {
      const isCorrectPassword = await AuthService.comparePasswords(
        data.password,
        user.passwordHash
      );
      if (!isCorrectPassword) {
        return createServiceReturn({
          error: createError({
            message: 'Incorrect password',
            code: ErrorCode.UNAUTHORIZED,
          }),
        });
      }
    } catch {
      console.error('Password comparison error');
      return createServiceReturn({
        error: createError({
          message: 'Password comparison error',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        }),
      });
    }

    await SessionService.getInstance().createUserSession(user, cookiesStore);
    return createServiceReturn({
      data: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: user.role,
      },
      status: 200,
    });
  }

  async logOut(cookiesStore: Cookies) {
    await SessionService.getInstance().removeUserFromSession(cookiesStore);
  }
}
