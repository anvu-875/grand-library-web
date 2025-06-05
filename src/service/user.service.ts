import { db } from '@/data-storage/db';
import { users, UserRole } from '@/data-storage/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import AuthService from './auth.service';
import { Cookies } from '@/lib/type';
import SessionService from './session.service';

const createdUserSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(1),
  password: z.string().min(8),
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

  private async createUser(
    email: string,
    userName: string,
    role: (typeof users.$inferInsert)['role'],
    passwordHash: string
  ) {
    const [user] = await db
      .insert(users)
      .values({
        email,
        userName,
        role,
        passwordHash,
      })
      .returning({ id: users.id, role: users.role });

    return user;
  }

  async adminCreateRoleUser(
    unsafeCredentials: z.infer<typeof createdUserSchema>,
    role: UserRole,
    cookiesStore: Cookies
  ) {
    const adminUser =
      await SessionService.getInstance().getUserFromSession(cookiesStore);

    if (!adminUser) {
      throw new Error('Unauthorized: Admin authentication required');
    }

    if (adminUser.role != 'admin') {
      throw new Error('Unauthorized: User is not an admin');
    }

    const { success, data } = createdUserSchema.safeParse(unsafeCredentials);
    if (!success) {
      throw new Error('Invalid credentials');
    }

    const user = await this.getUserByEmail(data.email);

    if (user) {
      throw new Error(`User already exists (${data.email}-${user.role})`);
    }

    try {
      const passwordHash = await AuthService.hashPassword(data.password);

      const user = await this.createUser(
        data.email,
        data.userName,
        role,
        passwordHash
      );

      if (user == null) {
        throw new Error('Unable to create account');
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new Error('Unable to create account');
    }
  }
}
