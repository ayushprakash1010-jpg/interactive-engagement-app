'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleMeetApp } from '@/components/meet/GoogleMeetProvider';
import { SettingsSkeleton } from '@/components/ui';

export default function MeetPage() {
  const router = useRouter();
  const { isMeet, meetingId, userId, error } = useGoogleMeetApp();
  const [loading, setLoading] = useState(true);
  const [connectError, setConnectError] = useState('');

  useEffect(() => {
    async function handleMeetJoin() {
      if (error) return; // SDK failed — let the error UI render
      if (!isMeet) return; // Still initializing
      if (!meetingId) return; // Waiting for Meet context

      try {
        const params = new URLSearchParams({ meetingId });
        if (userId) params.set('meetUserId', userId);

        const res = await fetch(`/api/google-meet/context-to-event?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const { eventCode } = data;
          // Store Meet userId as anon identity for seamless participant enrollment
          if (userId) {
            localStorage.setItem('iep-anon-id', `meet-${userId}`);
          }
          router.replace(`/event/${eventCode}`);
        } else {
          // No auto-linked event — show code entry
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }

    handleMeetJoin();
  }, [isMeet, meetingId, userId, error, router]);

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-subtle text-error">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">Google Meet SDK Error</p>
          <p className="mt-1 text-xs text-ink-muted">{error}</p>
        </div>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8">
        <SettingsSkeleton />
        <p className="mt-4 text-center text-ink-muted">Connecting to your event...</p>
      </div>
    );
  }

  // ── Code entry fallback ────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-surface to-surface-sunken p-6">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00796B]/10 text-[#00796B] ring-1 ring-[#00796B]/20">
            {/* Google Meet inspired icon placeholder */}
            <svg className="h-9 w-9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Welcome to Pulse</h1>
          <p className="mt-2 text-ink-muted">
            Bring live polls &amp; Q&amp;A to your Google Meet session.
          </p>
        </div>

        {/* Action card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-card p-6 shadow-xl ring-1 ring-black/5">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Join an Event</h2>
          <p className="mb-6 text-sm text-ink-muted">
            Enter your host&apos;s Pulse event code to connect this meeting and participate in live polls and Q&amp;A.
          </p>

          <div className="flex flex-col gap-3">
            <input
              id="meet-event-code-input"
              type="text"
              placeholder="e.g. 2AGLAW"
              className="w-full rounded-xl border border-border bg-surface-sunken px-4 py-3 text-lg font-medium tracking-widest text-foreground uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-subtle focus:border-[#00796B] focus:outline-none focus:ring-1 focus:ring-[#00796B]"
            />
            {connectError && (
              <p className="text-xs text-error">{connectError}</p>
            )}
            <button
              id="meet-connect-btn"
              onClick={async () => {
                const input = document.getElementById('meet-event-code-input') as HTMLInputElement;
                const code = input.value.trim().toUpperCase();
                if (!code) return;
                setConnectError('');
                try {
                  const params = new URLSearchParams({ meetingId: meetingId ?? '', eventCode: code });
                  const res = await fetch(`/api/google-meet/link-meeting?${params.toString()}`);
                  if (res.ok) {
                    window.location.reload();
                  } else {
                    setConnectError('Event code not found. Please check and try again.');
                  }
                } catch {
                  setConnectError('Network error. Please try again.');
                }
              }}
              className="w-full rounded-xl bg-[#00796B] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#00695C] active:scale-[0.98]"
            >
              Connect to Meeting
            </button>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-6 rounded-lg bg-surface-raised p-3 text-left text-xs text-ink-subtle">
          <p>meetingId: {meetingId ?? 'n/a'}</p>
          <p>userId: {userId ?? 'n/a'}</p>
        </div>
      </div>
    </div>
  );
}
