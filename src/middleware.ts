import { NextRequest, NextResponse } from 'next/server';
import SessionService from './service/session.service';
import { cookies } from 'next/headers';
import { Cookies } from './lib/type';

const modRoutes: string[] = [];
const adminRoutes: string[] = [];

export async function middleware(request: NextRequest) {
  const _pathname = request.nextUrl.pathname;

  // Reset session token expiration for each request
  // This is to ensure that the session remains active as long as the user is interacting with the site
  const cookiesStore = await cookies();
  await SessionService.getInstance().updateUserSessionExpiration(cookiesStore);

  // Check authentication for mod and admin routes
  const response =
    (await middlewareAuth(request, cookiesStore)) ?? NextResponse.next();

  if (request.method === 'GET') {
    // Rewrite routes that match "/[...slug]/edit" to "/editor/[...slug]"
    if (request.nextUrl.pathname.endsWith('/edit')) {
      const pathWithoutEdit = request.nextUrl.pathname.slice(
        0,
        request.nextUrl.pathname.length - 5
      );
      const pathWithEditPrefix = `/editor${pathWithoutEdit}`;

      return NextResponse.rewrite(new URL(pathWithEditPrefix, request.url));
    }

    // Disable "/editor/[...slug]"
    if (request.nextUrl.pathname.startsWith('/editor')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

async function middlewareAuth(request: NextRequest, cookiesStore: Cookies) {
  if (modRoutes.includes(request.nextUrl.pathname)) {
    const user =
      await SessionService.getInstance().getUserFromSession(cookiesStore);
    if (user == null) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    if (user.role !== 'mod') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (adminRoutes.includes(request.nextUrl.pathname)) {
    const user =
      await SessionService.getInstance().getUserFromSession(cookiesStore);
    if (user == null) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
