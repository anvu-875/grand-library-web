import { userRoles } from '@/data-storage/schema';
import { z } from 'zod';
import uid from 'uid-safe';
import redisClient from '@/data-storage/redis';
import { Cookies } from '@/lib/type';

const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
const COOKIE_SESSION_KEY = 'session_id';
const genSessionTag = (sessionId: string) => `session:${sessionId}`;

const sessionSchema = z.object({
  id: z.string(),
  role: z.enum(userRoles),
});

type UserSession = z.infer<typeof sessionSchema>;

export default class SessionService {
  private static instance: SessionService | null = null;

  private constructor() {}

  public static getInstance() {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  async getUserSessionById(sessionId: string) {
    const rawUser = await redisClient.get(genSessionTag(sessionId));
    const { success, data: user } = sessionSchema.safeParse(rawUser);
    return success ? user : null;
  }

  getUserFromSession(cookiesStore: Pick<Cookies, 'get'>) {
    const sessionId = cookiesStore.get(COOKIE_SESSION_KEY)?.value;
    if (!sessionId) return null;

    return this.getUserSessionById(sessionId);
  }

  async removeUserFromSession(cookiesStore: Pick<Cookies, 'get' | 'delete'>) {
    const sessionId = cookiesStore.get(COOKIE_SESSION_KEY)?.value;
    if (!sessionId) return null;

    cookiesStore.delete(COOKIE_SESSION_KEY);
    await redisClient.del(genSessionTag(sessionId));
  }

  private setCookie(sessionId: string, cookiesStore: Pick<Cookies, 'set'>) {
    cookiesStore.set(COOKIE_SESSION_KEY, sessionId, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
    });
  }

  private async setSession(sessionId: string, user: UserSession) {
    return await redisClient.set(
      genSessionTag(sessionId),
      sessionSchema.parse(user),
      {
        ex: SESSION_EXPIRATION_SECONDS,
      }
    );
  }

  async createUserSession(
    user: UserSession,
    cookiesStore: Pick<Cookies, 'set'>
  ) {
    const sessionId = uid.sync(18);
    this.setCookie(sessionId, cookiesStore);
    await this.setSession(sessionId, user);
  }

  async updateUserSessionExpiration(
    cookiesStore: Pick<Cookies, 'get' | 'set'>
  ) {
    const sessionId = cookiesStore.get(COOKIE_SESSION_KEY)?.value;
    if (sessionId == null) return null;

    const user = await this.getUserSessionById(sessionId);
    if (user == null) return;

    this.setCookie(sessionId, cookiesStore);
    await this.setSession(sessionId, user);
  }
}
