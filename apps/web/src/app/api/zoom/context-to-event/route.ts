import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

export async function GET(req: NextRequest) {
  const meetingId = req.nextUrl.searchParams.get('meetingId');
  const zoomUserId = req.nextUrl.searchParams.get('zoomUserId');

  if (!meetingId) {
    return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 });
  }

  try {
    const target = `${API_URL.replace(/\/+$/, '')}/api/zoom/context-to-event?meetingId=${meetingId}${zoomUserId ? `&zoomUserId=${zoomUserId}` : ''}`;
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
