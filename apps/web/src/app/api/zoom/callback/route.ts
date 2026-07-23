import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // If Zoom sent back an error, redirect to the connect page with an error message
  if (error) {
    return NextResponse.redirect(new URL(`/dashboard/settings?zoom_error=${error}`, url.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?zoom_error=missing_code', url.origin));
  }

  // Call the backend API SERVER-SIDE (not a browser redirect).
  // This keeps the browser URL on questliv.com so redirect_uri matches what Zoom has registered.
  const backendUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  const params = new URLSearchParams({ code });
  if (state) params.set('state', state);

  try {
    const backendRes = await fetch(`${backendUrl}/api/zoom/callback?${params.toString()}`, {
      method: 'GET',
      // Forward any cookies so the backend can identify the user session if needed
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
      },
      redirect: 'manual', // Don't auto-follow redirects from backend
    });

    // The NestJS backend returns 302 on success (redirecting to /zoom/success).
    // Any 2xx or 3xx means success.
    if (backendRes.ok || (backendRes.status >= 300 && backendRes.status < 400)) {
      // Success — send user to their dashboard settings page to see Zoom is now connected
      return NextResponse.redirect(new URL('/dashboard/settings?zoom_connected=true', url.origin));
    }

    const errorText = await backendRes.text();
    console.error('[zoom/callback] Backend error:', backendRes.status, errorText);
    return NextResponse.redirect(new URL(`/dashboard/settings?zoom_error=backend_${backendRes.status}`, url.origin));
  } catch (err) {
    console.error('[zoom/callback] Fetch failed:', err);
    return NextResponse.redirect(new URL('/dashboard/settings?zoom_error=network', url.origin));
  }

}
