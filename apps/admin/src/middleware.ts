import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';

/**
 * Guards all routes except /login, /access-denied, and /api/*.
 * Unauthenticated visitors are redirected to /login, which then
 * initiates Auth0 Universal Login.
 *
 * RBAC (admin role) is enforced by the NestJS backend on every
 * /admin/* API call. The frontend shows /access-denied when the
 * API returns 403, providing a friendly UX for non-admin users.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);

  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnTo', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - /login (public)
     * - /access-denied (public)
     * - /api/* (handled by route handlers)
     * - /_next/* (Next.js internals)
     * - /brand/* (static brand assets)
     */
    '/((?!login|access-denied|api|_next/static|_next/image|brand|favicon.ico).*)',
  ],
};
