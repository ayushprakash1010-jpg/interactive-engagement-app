import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Forward the browser to the backend callback endpoint
  const backendUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const targetUrl = `${backendUrl}/api/powerpoint/callback?${searchParams.toString()}`;

  return NextResponse.redirect(targetUrl);
}
