'use client';

import * as React from 'react';
import { Play, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TutorialVideo } from '@/lib/tutorial-videos';

export interface VideoPlayerProps {
  /** The tutorial video to display */
  video: TutorialVideo;
  /** Visual variant */
  variant?: 'card' | 'inline' | 'compact';
  /** Additional class names for the outer container */
  className?: string;
  /** Called when the user clicks the play button */
  onPlay?: (video: TutorialVideo) => void;
}

/**
 * VideoPlayer — thumbnail + play button overlay.
 * Clicking triggers `onPlay` which should open a VideoModal.
 *
 * This component is provider-independent: it only displays the thumbnail and
 * routes play events to the parent. All provider-specific embed logic lives in
 * VideoModal.
 */
export function VideoPlayer({ video, variant = 'card', className, onPlay }: VideoPlayerProps) {
  const handleClick = () => {
    onPlay?.(video);
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'group flex items-center gap-2 rounded-md border border-border bg-surface-card px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-brand/40 hover:bg-brand-subtle hover:text-brand-subtle-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          className,
        )}
        aria-label={`Watch tutorial: ${video.title}`}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-sm transition-transform group-hover:scale-110">
          <Play className="h-2.5 w-2.5 fill-current" />
        </span>
        <span className="truncate">Watch tutorial</span>
        {video.duration && (
          <span className="ml-auto shrink-0 text-xs text-ink-muted">{video.duration}</span>
        )}
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'group relative block w-full overflow-hidden rounded-lg border border-border bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          className,
        )}
        aria-label={`Play tutorial: ${video.title}`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-surface-sunken">
          {video.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Play className="h-8 w-8 text-ink-muted/40" />
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <Play className="h-4 w-4 fill-current text-brand" />
            </span>
          </div>

          {/* Duration badge */}
          {video.duration && (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
              <Clock className="h-2.5 w-2.5" />
              {video.duration}
            </span>
          )}
        </div>

        {/* Caption */}
        <div className="px-3 py-2 text-left">
          <p className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-brand">
            {video.title}
          </p>
        </div>
      </button>
    );
  }

  // Default: 'card' variant
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-xl border border-border bg-surface-card text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        className,
      )}
      aria-label={`Play tutorial: ${video.title}`}
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-sunken">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-10 w-10 text-ink-muted/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* Centered play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-xl">
            <Play className="h-5 w-5 fill-current text-brand" />
          </span>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            <Clock className="h-2.5 w-2.5" />
            {video.duration}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-brand">
          {video.title}
        </h3>
        {video.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
            {video.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
            <Play className="h-3 w-3 fill-current" />
            Watch tutorial
          </span>
        </div>
      </div>
    </button>
  );
}
