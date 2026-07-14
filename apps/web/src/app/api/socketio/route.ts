/**
 * Socket.IO HTTP long-poll proxy.
 *
 * The Zoom App embedded browser runs in HTTPS context, so it cannot connect
 * directly to http://localhost:4000 (Mixed Content). This route forwards all
 * Socket.IO polling GET/POST requests to the local NestJS backend, keeping
 * everything on the same HTTPS origin (dry-views-listen.loca.lt).
 *
 * WebSocket upgrades are NOT proxied here — polling-only transport is forced
 * for the HTTPS path (see socket.ts).
 */
import { type NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

// Allow long-polling GET to hang up to 60 s before timing out.
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

async function proxy(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  // Forward full query string: EIO, transport, sid, t, …
  const target = `${BACKEND}/socket.io/${url.search}`;

  // Forward headers, stripping hop-by-hop headers that break Node fetch.
  const fwd: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (!['host', 'connection', 'transfer-encoding', 'upgrade'].includes(k)) {
      fwd[key] = value;
    }
  });

  let body: string | undefined;
  if (req.method === 'POST') {
    body = await req.text();
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(target, { method: req.method, headers: fwd, body });
  } catch (err) {
    return NextResponse.json(
      { error: 'Socket proxy fetch failed', detail: String(err) },
      { status: 502 },
    );
  }

  const resBody = await backendRes.text();

  return new NextResponse(resBody, {
    status: backendRes.status,
    headers: {
      'content-type': backendRes.headers.get('content-type') ?? 'text/plain',
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
    },
  });
}

export const GET = proxy;
export const POST = proxy;

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': '*',
    },
  });
}
