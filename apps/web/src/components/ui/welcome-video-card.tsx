'use client';

import * as React from 'react';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { VideoModal, useVideoModal } from '@/components/ui/video-modal';
import { getVideoById } from '@/lib/tutorial-videos';

// =============================================================================
// localStorage helpers — SSR-safe (window check prevents hydration errors)
// =============================================================================

const LS_KEY = 'pulse_welcome_video_dismissed';

function getIsDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LS_KEY) === 'true';
  } catch {
    return false;
  }
}

function setDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, 'true');
  } catch {
    // ignore (e.g. private browsing with storage disabled)
  }
}

// =============================================================================
// WelcomeVideoCard
// =============================================================================

export interface WelcomeVideoCardProps {
  /** Optional additional className for the card */
  className?: string;
}

/**
 * WelcomeVideoCard — shown on the dashboard for first-time / zero-event users.
 *
 * - Dismissible: stores state in localStorage (SSR-safe)
 * - Uses the 'getting-started' tutorial video
 * - Opens VideoModal on play
 * - Does NOT require a backend API
 */
export function WelcomeVideoCard({ className }: WelcomeVideoCardProps) {
  const { activeVideo, openVideo, closeVideo } = useVideoModal();

  // SSR-safe mount state — avoids hydration mismatch from localStorage
  const [mounted, setMounted] = React.useState(false);
  const [dismissed, setDismissedState] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setDismissedState(getIsDismissed());
  }, []);

  const handleDismiss = () => {
    setDismissed();
    setDismissedState(true);
  };

  const handlePlay = () => {
    const video = getVideoById('getting-started');
    if (video) openVideo(video);
  };

  // Don't render until client-side to avoid hydration mismatch
  if (!mounted || dismissed) return null;

  const video = getVideoById('getting-started');

  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-brand/20 bg-gradient-to-br from-brand-subtle to-surface-card p-5 shadow-xs',
          className,
        )}
      >
        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sunken hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          aria-label="Dismiss getting started card"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Thumbnail preview (small) */}
          {video?.thumbnailUrl && (
            <div className="relative h-[90px] w-[160px] shrink-0 overflow-hidden rounded-lg border border-border bg-surface-sunken shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow">
                  <Play className="h-3 w-3 fill-current text-brand" />
                </span>
              </div>
            </div>
          )}

          {/* Text + actions */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                Get started
              </span>
              {video?.duration && (
                <span className="text-xs text-ink-muted">{video.duration}</span>
              )}
            </div>
            <h3 className="mt-1.5 text-sm font-semibold text-foreground">
              New to Pulse? Watch the quick intro
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Learn how to create your first event, invite participants, and run a live poll in under 2 minutes.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={handlePlay}
                className="gap-1.5"
              >
                <Play className="h-3 w-3 fill-current" />
                Watch intro
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-ink-muted hover:text-foreground"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video modal */}
      <VideoModal video={activeVideo} onClose={closeVideo} />
    </>
  );
}
