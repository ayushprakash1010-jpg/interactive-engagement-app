'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePowerPointApp } from '@/components/powerpoint/PowerPointProvider';
import { SettingsSkeleton } from '@/components/ui';

export default function PowerPointPage() {
  const router = useRouter();
  const { isPowerPoint, presentationId, presentationName, microsoftUserId, error } =
    usePowerPointApp();

  const [loading, setLoading] = useState(true);
  const [connectError, setConnectError] = useState('');
  const [linking, setLinking] = useState(false);

  // On load: try to auto-link this presentation to an existing event
  useEffect(() => {
    async function handlePresentationJoin() {
      if (error) return; // SDK failed — let the error UI render
      if (!isPowerPoint) return; // Still initializing
      if (!presentationId) return; // Waiting for Office.js to resolve

      try {
        const params = new URLSearchParams({ presentationId });
        if (microsoftUserId) params.set('microsoftUserId', microsoftUserId);

        const res = await fetch(`/api/powerpoint/context-to-event?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const { eventCode } = data;
          // Store presentationId as anon identity so participants are auto-enrolled
          if (presentationId) {
            localStorage.setItem('iep-anon-id', `ppt-${presentationId}`);
          }
          router.replace(`/event/${eventCode}`);
        } else {
          // No event linked yet — show code entry UI
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }

    handlePresentationJoin();
  }, [isPowerPoint, presentationId, microsoftUserId, error, router]);

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-subtle text-error">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">PowerPoint SDK Error</p>
          <p className="mt-1 text-xs text-ink-muted">{error}</p>
          <p className="mt-3 text-xs text-ink-subtle">
            Make sure you have opened this add-in from within Microsoft PowerPoint.
          </p>
        </div>
      </div>
    );
  }

  // ── Loading/connecting state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8">
        <SettingsSkeleton />
        <p className="mt-4 text-center text-ink-muted">Connecting to your event...</p>
      </div>
    );
  }

  // ── Code entry fallback — no event auto-linked ────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-surface to-surface-sunken p-6">
      <div className="w-full max-w-md">

        {/* Brand header */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D04423]/10 text-[#D04423] ring-1 ring-[#D04423]/20">
            {/* PowerPoint-inspired icon */}
            <svg className="h-9 w-9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3v-1h5v1H8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Welcome to Pulse</h1>
          <p className="mt-2 text-ink-muted">
            Bring live polls &amp; Q&amp;A to your PowerPoint presentation.
          </p>
        </div>

        {/* Presentation info */}
        {presentationName && (
          <div className="mb-4 rounded-xl border border-border bg-surface-raised px-4 py-3 text-center">
            <p className="text-xs text-ink-subtle">Current presentation</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">
              {presentationName}
            </p>
          </div>
        )}

        {/* Action card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-card p-6 shadow-xl ring-1 ring-black/5">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Link to a Pulse Event</h2>
          <p className="mb-6 text-sm text-ink-muted">
            Enter your Pulse event code to connect this presentation and enable live polls
            &amp; Q&amp;A for your audience.
          </p>

          <div className="flex flex-col gap-3">
            <input
              id="ppt-event-code-input"
              type="text"
              placeholder="e.g. 2AGLAW"
              className="w-full rounded-xl border border-border bg-surface-sunken px-4 py-3 text-lg font-medium tracking-widest text-foreground uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-subtle focus:border-[#D04423] focus:outline-none focus:ring-1 focus:ring-[#D04423]"
            />
            {connectError && (
              <p className="text-xs text-error">{connectError}</p>
            )}
            <button
              id="ppt-connect-btn"
              disabled={linking}
              onClick={async () => {
                const input = document.getElementById('ppt-event-code-input') as HTMLInputElement;
                const code = input.value.trim().toUpperCase();
                if (!code) return;
                setConnectError('');
                setLinking(true);
                try {
                  const params = new URLSearchParams({
                    presentationId: presentationId ?? '',
                    eventCode: code,
                  });
                  const res = await fetch(`/api/powerpoint/link-presentation?${params.toString()}`);
                  if (res.ok) {
                    window.location.reload();
                  } else {
                    const data = await res.json().catch(() => ({}));
                    setConnectError(
                      data?.message || 'Event code not found. Please check and try again.',
                    );
                  }
                } catch {
                  setConnectError('Network error. Please try again.');
                } finally {
                  setLinking(false);
                }
              }}
              className="w-full rounded-xl bg-[#D04423] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#B03A1C] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {linking ? 'Connecting…' : 'Connect to Presentation'}
            </button>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-6 rounded-lg bg-surface-raised p-3 text-left text-xs text-ink-subtle">
          <p>presentationId: {presentationId ?? 'n/a'}</p>
          <p>microsoftUserId: {microsoftUserId ?? 'n/a (using manual link)'}</p>
        </div>
      </div>
    </div>
  );
}
