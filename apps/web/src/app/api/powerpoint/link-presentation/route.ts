import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

export const POST = withApiAuthRequired(async (req: NextRequest) => {
  const presentationId = req.nextUrl.searchParams.get('presentationId');
  const eventCode = req.nextUrl.searchParams.get('eventCode');

  if (!presentationId || !eventCode) {
    return NextResponse.json({ error: 'Missing presentationId or eventCode' }, { status: 400 });
  }

  try {
    const { accessToken } = await getAccessToken();
    const params = new URLSearchParams({ presentationId, eventCode });
    const target = `${API_URL.replace(/\/+$/, '')}/api/powerpoint/link-presentation?${params.toString()}`;
    const apiRes = await fetch(target, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (apiRes.ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to link' }, { status: apiRes.status });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
});
