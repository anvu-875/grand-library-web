import z from 'zod';
import UserService from './user.service';
import crypto from 'crypto';
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

  static hashPassword(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.scrypt(password.normalize(), salt, 64, (err, hash) => {
        if (err) reject(err);
        resolve(hash.toString('hex').normalize());
      });
    });
  }

  static generateSalt() {
    return crypto.randomBytes(16).toString('hex');
  }

  static async comparePasswords(
    password: string,
    salt: string,
    hashedPassword: string
  ) {
    const inputHashedPw = await AuthService.hashPassword(password, salt);
    return crypto.timingSafeEqual(
      Buffer.from(inputHashedPw, 'hex'),
      Buffer.from(hashedPassword, 'hex')
    );
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

    const isCorrectPassword = await AuthService.comparePasswords(
      data.password,
      user.passwordSalt,
      user.passwordHash
    );

    if (!isCorrectPassword) {
      throw new Error('Wrong password');
    }

    await SessionService.getInstance().createUserSession(user, cookiesStore);
  }
}
