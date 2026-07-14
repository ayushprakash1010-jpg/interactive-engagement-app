import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

export async function GET(req: NextRequest) {
  const presentationId = req.nextUrl.searchParams.get('presentationId');
  const eventCode = req.nextUrl.searchParams.get('eventCode');

  if (!presentationId || !eventCode) {
    return NextResponse.json({ error: 'Missing presentationId or eventCode' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({ presentationId, eventCode });
    const target = `${API_URL.replace(/\/+$/, '')}/api/powerpoint/link-presentation?${params.toString()}`;
    const apiRes = await fetch(target);

    if (apiRes.ok) {
      const data = await apiRes.json();
      return NextResponse.json(data);
    } else {
      const errData = await apiRes.json().catch(() => ({}));
      return NextResponse.json(errData, { status: apiRes.status });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
