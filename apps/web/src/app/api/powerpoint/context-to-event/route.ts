import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

export async function GET(req: NextRequest) {
  const presentationId = req.nextUrl.searchParams.get('presentationId');
  const microsoftUserId = req.nextUrl.searchParams.get('microsoftUserId');

  if (!presentationId) {
    return NextResponse.json({ error: 'Missing presentationId' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({ presentationId });
    if (microsoftUserId) params.set('microsoftUserId', microsoftUserId);

    const target = `${API_URL.replace(/\/+$/, '')}/api/powerpoint/context-to-event?${params.toString()}`;
    const apiRes = await fetch(target);

    if (apiRes.ok) {
      const data = await apiRes.json();
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Failed' }, { status: apiRes.status });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
