import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

export const dynamic = 'force-dynamic';

const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

async function proxyLogic(req: NextRequest, token: string | undefined) {
  const path = req.nextUrl.pathname.replace(/^\/api\/proxy\/?/, '');
  const target = `${API_URL.replace(/\/+$/, '')}/${path}${req.nextUrl.search}`;

  if (!token) {
    return NextResponse.json(
      { message: 'No access token in session — log out and back in' },
      { status: 401 },
    );
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
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
    console.error(`[proxy] fetch to ${target} failed:`, err);
    return NextResponse.json(
      { message: 'Proxy fetch failed', error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  const contentType = apiRes.headers.get('content-type') ?? 'application/json';

  if (apiRes.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  // Binary content types (PDF, CSV, octet-stream) must be forwarded as raw bytes.
  // Using apiRes.text() on binary data corrupts it because Node's UTF-8 decoder
  // replaces invalid byte sequences, producing a blank or broken file on the client.
  const isBinary =
    contentType.includes('application/pdf') ||
    contentType.includes('application/octet-stream') ||
    contentType.includes('text/csv');

  if (isBinary) {
    const buffer = await apiRes.arrayBuffer();
    return new NextResponse(buffer, {
      status: apiRes.status,
      headers: {
        'content-type': contentType,
        'content-disposition':
          apiRes.headers.get('content-disposition') ?? '',
      },
    });
  }

  const payload = await apiRes.text();

  return new NextResponse(payload, {
    status: apiRes.status,
    headers: {
      'content-type': contentType,
    },
  });
}

const auth0Handler = withApiAuthRequired(async function auth0Handler(req: NextRequest) {
  let accessToken: string | undefined;
  try {
    ({ accessToken } = await getAccessToken());
  } catch (err) {
    console.error('[proxy] getAccessToken failed:', err);
    return NextResponse.json(
      {
        message: 'Could not obtain an access token',
        reason: err instanceof Error ? err.message : String(err),
      },
      { status: 401 },
    );
  }
  return proxyLogic(req, accessToken);
});

export const GET = async (req: NextRequest, ctx: any) => {
  const impToken = req.cookies.get('iep_impersonation_token')?.value;
  if (impToken) return proxyLogic(req, impToken);
  return auth0Handler(req, ctx);
};
export const POST = async (req: NextRequest, ctx: any) => {
  const impToken = req.cookies.get('iep_impersonation_token')?.value;
  if (impToken) return proxyLogic(req, impToken);
  return auth0Handler(req, ctx);
};
export const PUT = async (req: NextRequest, ctx: any) => {
  const impToken = req.cookies.get('iep_impersonation_token')?.value;
  if (impToken) return proxyLogic(req, impToken);
  return auth0Handler(req, ctx);
};
export const PATCH = async (req: NextRequest, ctx: any) => {
  const impToken = req.cookies.get('iep_impersonation_token')?.value;
  if (impToken) return proxyLogic(req, impToken);
  return auth0Handler(req, ctx);
};
export const DELETE = async (req: NextRequest, ctx: any) => {
  const impToken = req.cookies.get('iep_impersonation_token')?.value;
  if (impToken) return proxyLogic(req, impToken);
  return auth0Handler(req, ctx);
};
export const HEAD = async (req: NextRequest, ctx: any) => {
  const impToken = req.cookies.get('iep_impersonation_token')?.value;
  if (impToken) return proxyLogic(req, impToken);
  return auth0Handler(req, ctx);
};