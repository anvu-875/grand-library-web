import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const _pathname = request.nextUrl.pathname;

  // Add basic security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // Add Content-Security-Policy in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
    );
  }

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

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
