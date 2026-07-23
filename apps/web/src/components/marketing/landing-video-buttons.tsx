'use client';

import * as React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoModal, useVideoModal } from '@/components/ui/video-modal';
import { getVideoById } from '@/lib/tutorial-videos';

/**
 * LandingDemoButton — "Watch demo" CTA for the landing page hero.
 * This is a client component wrapping VideoModal, keeping the landing page as a server component.
 */
export function LandingDemoButton() {
  const { activeVideo, openVideo, closeVideo } = useVideoModal();

  const handleClick = () => {
    const video = getVideoById('getting-started');
    if (video) openVideo(video);
  };

  return (
    <>
      <Button
        size="xl"
        variant="outline"
        className="gap-2"
        onClick={handleClick}
        id="landing-watch-demo-btn"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-sm">
          <Play className="h-2.5 w-2.5 fill-current" />
        </span>
        Watch demo
      </Button>

      <VideoModal video={activeVideo} onClose={closeVideo} />
    </>
  );
}

/**
 * StepDemoLink — inline "Watch clip" link for a single step card.
 * Used in the "How it works" section.
 */
export function StepDemoLink({ videoId, label = 'Watch clip' }: { videoId: string; label?: string }) {
  const { activeVideo, openVideo, closeVideo } = useVideoModal();

  const handleClick = () => {
    const video = getVideoById(videoId);
    if (video) openVideo(video);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        id={`landing-step-demo-${videoId}`}
      >
        <Play className="h-3 w-3 fill-current" />
        {label}
      </button>

      <VideoModal video={activeVideo} onClose={closeVideo} />
    </>
  );
}
