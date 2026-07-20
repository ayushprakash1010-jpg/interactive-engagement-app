import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';

/**
 * Guards the /dashboard route group. Unauthenticated visitors are sent to the
 * branded /login page (which then kicks off Universal Login), preserving the
 * originally requested path via ?returnTo so they land back where they started.
 */
export async function middleware(req: NextRequest) {
  const handoffCode = req.nextUrl.searchParams.get('handoffCode');

  if (handoffCode) {
    const url = new URL(req.url);
    url.searchParams.delete('handoffCode');
    const response = NextResponse.redirect(url);
    
    try {
      const apiUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const apiRes = await fetch(`${apiUrl}/admin/impersonate/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: handoffCode }),
      });
      
      if (apiRes.ok) {
        const data = await apiRes.json();
        
        response.cookies.set('iep_impersonation_token', data.token, {
          path: '/',
          httpOnly: true,
          secure: req.nextUrl.protocol === 'https:',
          sameSite: 'lax',
          maxAge: 3600, // 1 hour matching the token
        });
      } else {
        console.error(`[Middleware] Failed to exchange handoff code, status: ${apiRes.status}`);
      }
    } catch (e) {
      console.error('[Middleware] Failed to exchange handoff code', e);
    }

    return response;
  }

  const res = NextResponse.next();
  const session = await getSession(req, res);
  const hasImpersonationCookie = req.cookies.has('iep_impersonation_token');

  if (!session && !hasImpersonationCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnTo', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
