import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

export async function GET(req: NextRequest) {
  const meetingId = req.nextUrl.searchParams.get('meetingId');
  const eventCode = req.nextUrl.searchParams.get('eventCode');

  if (!meetingId || !eventCode) {
    return NextResponse.json({ error: 'Missing meetingId or eventCode' }, { status: 400 });
  }

  try {
    const target = `${API_URL.replace(/\/+$/, '')}/api/zoom/link-meeting?meetingId=${meetingId}&eventCode=${eventCode}`;
    const apiRes = await fetch(target);
    
    if (apiRes.ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to link' }, { status: apiRes.status });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
