'use client';

import { useEffect } from 'react';

export default function ZoomSuccessPage() {
  useEffect(() => {
    // Zoom requires that web authorization flows redirect the user back into the Zoom Desktop Client
    // using a deep link so the app opens natively in Zoom.
    
    // We try to trigger the deep link automatically after a short delay
    const timer = setTimeout(() => {
      window.location.href = 'zoomus://zoom.us/client/latest/launch?action=app';
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-surface to-surface-sunken p-6 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 ring-4 ring-green-50">
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="mb-4 text-3xl font-display font-bold text-foreground">Authorization Successful!</h1>
      <p className="mb-8 max-w-md text-lg text-ink-muted">
        Pulse has been successfully added to your Zoom account. You can now use it inside any Zoom meeting.
      </p>

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-ink-subtle">
          Redirecting you back to Zoom...
        </p>
        
        <a 
          href="zoomus://zoom.us/client/latest/launch?action=app"
          className="rounded-xl bg-brand px-8 py-4 text-base font-semibold text-brand-text shadow-md transition-all hover:bg-brand-hover hover:shadow-lg active:scale-95"
        >
          Open Zoom Client
        </a>
      </div>
    </div>
  );
}
