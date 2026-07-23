'use client';

import * as React from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoModal, useVideoModal } from '@/components/ui/video-modal';
import type { TutorialVideo } from '@/lib/tutorial-videos';

export interface VideoCalloutProps {
  /** The tutorial video to reference */
  video: TutorialVideo;
  /** Callout text shown before the link */
  label?: string;
  /** Visual tone matching the feature's context */
  tone?: 'default' | 'ai' | 'brand';
  /** Additional className */
  className?: string;
}

/**
 * VideoCallout — a subtle contextual "Watch tutorial" banner.
 *
 * Used on feature pages (AI Studio, Analytics, Integrations) to surface a
 * relevant tutorial without cluttering the primary interface.
 *
 * Renders inline — does not open a separate page.
 */
export function VideoCallout({ video, label, tone = 'default', className }: VideoCalloutProps) {
  const { activeVideo, openVideo, closeVideo } = useVideoModal();

  const handlePlay = () => {
    openVideo(video);
  };

  const toneClasses = {
    default: 'border-border bg-surface-raised text-foreground hover:border-brand/30 hover:bg-surface-card',
    brand: 'border-brand/20 bg-brand-subtle text-brand-subtle-text hover:border-brand/40 hover:bg-brand-subtle',
    ai: 'border-ai-border bg-ai-subtle text-ai-subtle-text hover:border-ai/40 hover:bg-ai-subtle',
  };

  const iconClasses = {
    default: 'bg-brand text-brand-foreground',
    brand: 'bg-brand text-brand-foreground',
    ai: 'bg-ai text-white',
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePlay}
        className={cn(
          'group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          toneClasses[tone],
          className,
        )}
        aria-label={`Watch tutorial: ${video.title}`}
      >
        {/* Play icon */}
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform duration-200 group-hover:scale-110',
            iconClasses[tone],
          )}
        >
          <Play className="h-3 w-3 fill-current" />
        </span>

        {/* Text */}
        <span className="min-w-0 flex-1">
          <span className="block font-medium leading-tight">
            {label ?? `New to ${video.title.split(' ')[0]}? Watch a quick walkthrough`}
          </span>
          {video.duration && (
            <span className="mt-0.5 block text-xs opacity-70">{video.duration} tutorial</span>
          )}
        </span>

        {/* Arrow indicator */}
        <svg
          className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <VideoModal video={activeVideo} onClose={closeVideo} />
    </>
  );
}
