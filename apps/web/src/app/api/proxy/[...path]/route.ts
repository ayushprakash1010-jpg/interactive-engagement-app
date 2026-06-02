import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

/**
 * Authenticated reverse proxy to the NestJS API (apps/api).
 *
 * The browser only ever talks to this same-origin route — it never sees the
 * Auth0 access token. This handler pulls the token from the encrypted session
 * cookie, forwards the request to the API with a Bearer header, and streams the
 * response back. This is the "thin BFF" from the architecture doc: it keeps
 * tokens server-side and removes any cross-origin/CORS concern.
 *
 *   /api/proxy/events        -> GET  {API}/events
 *   /api/proxy/events/:id/qr -> GET  {API}/events/:id/qr
 *   /api/proxy/events/:id    -> PATCH/DELETE {API}/events/:id
 */
// This handler runs SERVER-SIDE (inside the web container in docker), so it must
// reach the API by its internal hostname (e.g. http://api:4000), not the public
// browser URL. Falls back to the public URL for local `pnpm dev`.
const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

const handler = withApiAuthRequired(async function handler(req: NextRequest) {
  // The catch-all segment lives after "/api/proxy/".
  const path = req.nextUrl.pathname.replace(/^\/api\/proxy\/?/, '');
  const target = `${API_URL}/${path}${req.nextUrl.search}`;

  let accessToken: string | undefined;
  try {
    ({ accessToken } = await getAccessToken());
  } catch (err) {
    // Surface the real reason (audience/API mismatch, expired token, no refresh
    // token, etc.) so it shows up in `docker compose logs web`.
    console.error('[proxy] getAccessToken failed:', err);
    return NextResponse.json(
      {
        message: 'Could not obtain an access token',
        reason: err instanceof Error ? err.message : String(err),
      },
      { status: 401 },
    );
  }

  if (!accessToken) {
    console.error('[proxy] getAccessToken returned no token (session has no access token)');
    return NextResponse.json(
      { message: 'No access token in session — log out and back in' },
      { status: 401 },
    );
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  const init: RequestInit = { method: req.method, headers };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.text();
    if (body) {
      init.body = body;
      headers['Content-Type'] =
        req.headers.get('content-type') ?? 'application/json';
    }
  }

  const apiRes = await fetch(target, init);
  const contentType = apiRes.headers.get('content-type') ?? '';

  // 204 No Content (e.g. DELETE) has no body to read.
  if (apiRes.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const payload = await apiRes.text();
  return new NextResponse(payload, {
    status: apiRes.status,
    headers: { 'content-type': contentType || 'application/json' },
  });
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
