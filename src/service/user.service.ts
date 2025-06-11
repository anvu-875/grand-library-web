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
import { createdUserSchema } from '@/lib/schema-validation';

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

  async getFullUserById<H extends boolean | undefined = undefined>(
    id: string,
    hash?: H
  ): Promise<
    H extends true
      ? {
          id: string;
          userName: string;
          email: string;
          role: UserRole;
          passwordHash: string;
          joinAt: Date;
        }
      : {
          id: string;
          userName: string;
          email: string;
          role: UserRole;
          joinAt: Date;
        } | null
  >;
  async getFullUserById(id: string, hash: boolean = false) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        passwordHash: hash,
      },
    });
    if (!user) return null;

    const { passwordHash, joinAt, email, id: uid, userName, role } = user;
    if (hash) {
      return { id: uid, userName, email, role, passwordHash, joinAt };
    }
    return { id: uid, userName, email, role, joinAt };
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
    ServiceReturn<
      {
        id: string;
        email: string;
        userName: string;
        role: UserRole;
      },
      {
        email?: string[];
        userName?: string[];
        password?: string[];
        message?: string;
      }
    >
  > {
    const adminUser =
      await SessionService.getInstance().getUserFromSession(cookiesStore);

    if (!adminUser) {
      return createServiceReturn({
        error: createError({
          code: ErrorCode.UNAUTHORIZED,
          content: {
            message: 'Unauthorized: Please log in as an admin',
          },
        }),
      });
    }

    if (adminUser.role != 'admin') {
      return createServiceReturn({
        error: createError({
          code: ErrorCode.FORBIDDEN,
          content: {
            message: 'Forbidden: Only admins can create users',
          },
        }),
      });
    }

    const { success, error, data } =
      createdUserSchema.safeParse(unsafeCredentials);
    if (!success) {
      return createServiceReturn({
        error: createError({
          code: ErrorCode.UNPROCESSABLE_ENTITY,
          content: error.flatten().fieldErrors,
        }),
      });
    }

    const user = await this.getUserByEmail(data.email);

    if (user) {
      return createServiceReturn({
        error: createError({
          code: ErrorCode.EXISTING_DATA,
          content: {
            message: 'User with this email already exists',
            email: ['Email is already in use'],
          },
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
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          content: {
            message: 'Failed to create user',
          },
        }),
      });
    }
  }
}
