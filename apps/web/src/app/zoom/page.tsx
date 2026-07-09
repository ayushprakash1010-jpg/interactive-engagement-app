'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useZoomApp } from '@/components/zoom/ZoomProvider';
import { SettingsSkeleton } from '@/components/ui';

export default function ZoomPage() {
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
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-2 text-xl font-bold">No Event Connected</h1>
      <p className="text-center text-ink-muted mb-6">
        Enter your Pulse event code to connect this Zoom meeting.
      </p>

      <div className="flex gap-2 w-full max-w-sm">
        <input
          id="event-code-input"
          type="text"
          placeholder="e.g. 2AGLAW"
          className="flex-1 px-3 py-2 border border-border rounded-md bg-surface-card text-foreground uppercase"
        />
        <button
          onClick={async () => {
            const code = (document.getElementById('event-code-input') as HTMLInputElement).value.trim().toUpperCase();
            if (!code) return;
            try {
              const res = await fetch(`/api/zoom/link-meeting?meetingId=${meetingId}&eventCode=${code}`);
              if (res.ok) {
                window.location.reload();
              } else {
                alert('Event code not found. Please check and try again.');
              }
            } catch (e) {
              alert('Network error. Please try again.');
            }
          }}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-hover"
        >
          Connect
        </button>
      </div>

      <div className="mt-8 text-xs text-ink-muted text-left w-full max-w-sm bg-surface-sunken p-4 rounded-md">
        <p className="font-medium mb-1">Debug Info</p>
        <p>meetingId: {meetingId}</p>
        <p>userId: {userId}</p>
      </div>
      <p id="debug-error" className="text-red-500 mt-4 text-xs font-bold"></p>
    </div>
  );
}
