import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

/**
 * Authenticated reverse proxy for the Admin Console.
 *
 * Architecture note: All NestJS API calls from apps/admin go through this
 * server-side route. The browser never makes cross-origin requests to the API —
 * the Auth0 access token is obtained server-side and forwarded as a Bearer
 * header by this proxy. CORS between the admin app origin and the NestJS API
 * is therefore NOT required.
 *
 * Pattern is identical to apps/web/src/app/api/proxy/[...path]/route.ts.
 */

const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

const handler = withApiAuthRequired(async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/^\/api\/proxy\/?/, '');
  const target = `${API_URL.replace(/\/+$/, '')}/${path}${req.nextUrl.search}`;

  let accessToken: string | undefined;

  try {
    ({ accessToken } = await getAccessToken());
  } catch (err) {
    console.error('[admin-proxy] getAccessToken failed:', err);
    return NextResponse.json(
      {
        message: 'Could not obtain an access token',
        reason: err instanceof Error ? err.message : String(err),
      },
      { status: 401 },
    );
  }

  if (!accessToken) {
    return NextResponse.json(
      { message: 'No access token in session — log out and back in' },
      { status: 401 },
    );
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.text();
    if (body) {
      init.body = body;
      headers['Content-Type'] =
        req.headers.get('content-type') ?? 'application/json';
    }
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(target, init);
  } catch (err) {
    console.error(`[admin-proxy] fetch to ${target} failed:`, err);
    return NextResponse.json(
      {
        message: 'Proxy fetch failed',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  const contentType = apiRes.headers.get('content-type') ?? 'application/json';

  if (apiRes.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const payload = await apiRes.text();

  return new NextResponse(payload, {
    status: apiRes.status,
    headers: { 'content-type': contentType },
  });
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
