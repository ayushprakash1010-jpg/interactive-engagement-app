import { NextResponse } from 'next/server';

// Vercel Cron Job — pings the Render API every 10 minutes to prevent it from
// spinning down on the free tier. Requests from Vercel IPs are NOT blocked by
// Cloudflare's bot protection, unlike requests from cron-job.org datacenters.
export const dynamic = 'force-dynamic';

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://iep-api-mdr7.onrender.com';

  try {
    const res = await fetch(`${apiUrl}/health`, {
      headers: {
        'User-Agent': 'Vercel-Cron-Keepalive/1.0',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15_000), // 15 s — Render cold starts can be slow
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { ok: res.ok, status: res.status, data },
      { status: 200 },
    );
  } catch (err) {
    // Even on timeout the initial TCP handshake has already woken Render up.
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
