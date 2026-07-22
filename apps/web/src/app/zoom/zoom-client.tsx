'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useZoomApp } from '@/components/zoom/ZoomProvider';
import { SettingsSkeleton } from '@/components/ui';

export default function ZoomClient() {
  const router = useRouter();
  const { isZoom, meetingId, userId, rawUserCtx, error } = useZoomApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleZoomJoin() {
      if (error) return; // Don't do anything if there's an error, let the UI render the error

      if (!isZoom) {
        // If not in Zoom context (and no error yet), we just wait.
        // Or if we know for sure it's not zoom, we could redirect, but let's just wait for error or success.
        return;
      }

      if (!meetingId) {
        return; // Waiting for Zoom context
      }

      try {
        const res = await fetch(`/api/zoom/context-to-event?meetingId=${meetingId}${userId ? `&zoomUserId=${userId}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          const { eventCode } = data;
          // Set anonId to zoom userId for automatic enrollment
          if (userId) {
            localStorage.setItem('iep-anon-id', userId);
          }
          router.replace(`/event/${eventCode}`);
        } else {
          // No event mapped
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    }

    handleZoomJoin();
  }, [isZoom, meetingId, userId, error, router]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">Failed to initialize Zoom App: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <SettingsSkeleton />
        <p className="mt-4 text-center text-ink-muted">Connecting to your event...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-surface to-surface-sunken p-6">
      <div className="w-full max-w-md">
        {/* Brand Logo/Header */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/20">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Welcome to Pulse</h1>
          <p className="mt-2 text-ink-muted">Turn your Zoom audience into active participants.</p>
        </div>

        {/* Action Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-card p-6 shadow-xl ring-1 ring-black/5">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Join an Event</h2>
          <p className="mb-6 text-sm text-ink-muted">
            Enter your host&apos;s event code to connect this meeting and participate in live polls and Q&amp;A.
          </p>

          <div className="flex flex-col gap-3">
            <input
              id="event-code-input"
              type="text"
              placeholder="e.g. 2AGLAW"
              className="w-full rounded-xl border border-border bg-surface-sunken px-4 py-3 text-lg font-medium tracking-widest text-foreground uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <button
              onClick={async () => {
                const code = (document.getElementById('event-code-input') as HTMLInputElement).value.trim().toUpperCase();
                if (!code) return;
                try {
                  const res = await fetch(`/api/public-proxy/api/zoom/link-meeting?meetingId=${meetingId}&eventCode=${code}`);
                  if (res.ok) {
                    window.location.reload();
                  } else {
                    alert('Event code not found. Please check and try again.');
                  }
                } catch (e) {
                  alert('Network error. Please try again.');
                }
              }}
              className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-text shadow-sm transition-all hover:bg-brand-hover active:scale-[0.98]"
            >
              Connect to Meeting
            </button>
          </div>
        </div>

        {/* Debug Info (collapsible or subtle) */}
        <div className="mt-8 text-center text-xs text-ink-subtle">
          <p>meetingId: {meetingId}</p>
          <p>userId: {userId}</p>
          <p id="debug-error" className="mt-2 text-error"></p>
        </div>
      </div>
    </div>
  );
}
