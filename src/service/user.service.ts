import { db } from '@/data-storage/db';
import { users, UserRole } from '@/data-storage/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import AuthService from './auth.service';
import { Cookies } from '@/lib/type';
import SessionService from './session.service';
import {
  createError,
  createServiceReturn,
  ErrorCode,
  ServiceReturn,
} from '@/lib/serviceReturn';

const createdUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  userName: z.string().min(1, { message: 'User name is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .refine((value) => !AuthService.isPasswordTooLong(value), {
      message: 'Password is too long',
    }),
});

export default class UserService {
  private static instance: UserService | null = null;

  private constructor() {}

  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }

    return UserService.instance;
  }

  async getUserByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user;
  }

  private async createUser({
    email,
    userName,
    role,
    passwordHash,
  }: {
    email: string;
    userName: string;
    role: UserRole;
    passwordHash: string;
  }) {
    const [user] = await db
      .insert(users)
      .values({
        email,
        userName,
        role,
        passwordHash,
      })
      .returning({
        id: users.id,
        userName: users.userName,
        email: users.email,
        role: users.role,
      });

    return user;
  }

  async adminCreateRoleUser(
    unsafeCredentials: z.infer<typeof createdUserSchema>,
    role: UserRole,
    cookiesStore: Cookies
  ): Promise<
    ServiceReturn<{
      id: string;
      email: string;
      userName: string;
      role: UserRole;
    }>
  > {
    const adminUser =
      await SessionService.getInstance().getUserFromSession(cookiesStore);

    if (!adminUser) {
      return createServiceReturn({
        error: createError({
          code: ErrorCode.UNAUTHORIZED,
          message: 'Unauthorized: No user session found',
        }),
      });
    }

    if (adminUser.role != 'admin') {
      return createServiceReturn({
        error: createError({
          code: ErrorCode.FORBIDDEN,
          message: 'Forbidden: Only admins can create users',
        }),
      });
    }

    const { success, error, data } =
      createdUserSchema.safeParse(unsafeCredentials);
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
      if (error.formErrors.fieldErrors.userName) {
        errorArr.push(
          createError({
            message: error.formErrors.fieldErrors.userName,
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

    const user = await this.getUserByEmail(data.email);

    if (user) {
      return createServiceReturn({
        error: createError({
          message: 'User with this email already exists',
          code: ErrorCode.CONFLICT_DATA,
        }),
      });
    }

    try {
      const passwordHash = await AuthService.hashPassword(data.password);

      const user = await this.createUser({
        email: data.email,
        userName: data.userName,
        role,
        passwordHash,
      });

      return createServiceReturn({
        data: user,
        status: 201, // HttpStatusCode.CREATED
      });
    } catch (error) {
      console.error(error);
      return createServiceReturn({
        error: createError({
          message: 'Failed to create user',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        }),
      });
    }
  }
}
