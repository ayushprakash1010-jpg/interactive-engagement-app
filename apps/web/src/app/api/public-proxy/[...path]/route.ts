/**
 * Public (unauthenticated) API proxy.
 *
 * Participant pages run in the Zoom App's HTTPS embedded browser and cannot
 * make direct HTTP requests to localhost:4000 (Mixed Content). This route
 * forwards GET / POST / PATCH calls to the local NestJS backend without
 * requiring an Auth0 session, so un-authenticated participant endpoints
 * (event lookup, survey sessions, etc.) work correctly in that context.
 */
import { type NextRequest, NextResponse } from 'next/server';

const BACKEND = 
  process.env.API_INTERNAL_URL ?? 
  process.env.NEXT_PUBLIC_API_URL ?? 
  'http://localhost:4000';

export const dynamic = 'force-dynamic';

async function proxy(req: NextRequest): Promise<NextResponse> {
  // Strip the /api/public-proxy prefix to get the real backend path.
  const backendPath = req.nextUrl.pathname.replace(/^\/api\/public-proxy\/?/, '');
  const target = `${BACKEND}/${backendPath}${req.nextUrl.search}`;

  const fwd: Record<string, string> = { 'content-type': 'application/json' };
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (!['host', 'connection', 'transfer-encoding'].includes(k)) {
      fwd[key] = value;
    }
  });

  let body: string | undefined;
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await req.text();
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(target, { method: req.method, headers: fwd, body });
  } catch (err) {
    return NextResponse.json(
      { error: 'Public proxy fetch failed', detail: String(err) },
      { status: 502 },
    );
  }

  const resBody = await backendRes.text();
  return new NextResponse(resBody, {
    status: backendRes.status,
    headers: {
      'content-type': backendRes.headers.get('content-type') ?? 'application/json',
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
