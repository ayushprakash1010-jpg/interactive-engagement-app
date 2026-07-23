'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TutorialVideo } from '@/lib/tutorial-videos';

// =============================================================================
// VideoEmbed — provider-aware embed renderer
// =============================================================================

function buildEmbedUrl(video: TutorialVideo): string | null {
  if (!video.videoUrl) return null;

  switch (video.provider) {
    case 'youtube': {
      // Ensure the URL has autoplay=1 and rel=0 params
      const url = new URL(video.videoUrl);
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('rel', '0');
      url.searchParams.set('modestbranding', '1');
      return url.toString();
    }
    case 'loom': {
      const url = new URL(video.videoUrl);
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('hide_owner', 'true');
      url.searchParams.set('hide_share', 'true');
      url.searchParams.set('hide_title', 'true');
      return url.toString();
    }
    case 'vimeo': {
      const url = new URL(video.videoUrl);
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('title', '0');
      url.searchParams.set('byline', '0');
      return url.toString();
    }
    case 'guidde':
      // Guidde embed URLs (e.g., with ?mode=videoOnly) work directly
      return video.videoUrl;
    case 'mp4':
      // Direct video — rendered via <video> tag, not iframe
      return video.videoUrl;
    case 'placeholder':
      // Use the raw URL as-is for placeholder testing
      return video.videoUrl || null;
    default:
      return video.videoUrl || null;
  }
}

interface VideoEmbedProps {
  video: TutorialVideo;
  onLoad?: () => void;
}

function VideoEmbed({ video, onLoad }: VideoEmbedProps) {
  const embedUrl = buildEmbedUrl(video);

  if (!embedUrl) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-ink-muted">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">Video not available</p>
      </div>
    );
  }

  if (video.provider === 'mp4') {
    return (
      <video
        src={embedUrl}
        controls
        autoPlay
        className="h-full w-full"
        onLoadedData={onLoad}
      >
        Your browser does not support video playback.
      </video>
    );
  }

  return (
    <iframe
      src={embedUrl}
      className="h-full w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      title={video.title}
      onLoad={onLoad}
    />
  );
}

// =============================================================================
// VideoModal
// =============================================================================

export interface VideoModalProps {
  /** The video to play — null/undefined = closed */
  video: TutorialVideo | null;
  /** Called when the modal should close */
  onClose: () => void;
  /** Additional className for the content panel */
  className?: string;
}

/**
 * VideoModal — full-screen lightbox for tutorial playback.
 *
 * Features:
 *  - Escape key to close
 *  - Click outside to close
 *  - Auto-pauses video when closed (by unmounting the embed)
 *  - Loading state with spinner
 *  - Accessible (focus trap, aria-labels, keyboard nav)
 *  - Responsive: 16/9 aspect ratio on all screen sizes
 */
export function VideoModal({ video, onClose, className }: VideoModalProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const isOpen = Boolean(video);

  // Reset loading state when a new video is selected
  React.useEffect(() => {
    if (video) {
      setIsLoaded(false);
    }
  }, [video]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />

        {/* Modal panel */}
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] px-4 focus:outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className,
          )}
          aria-describedby={video ? `video-modal-desc-${video.id}` : undefined}
        >
          <div className="overflow-hidden rounded-xl border border-border bg-black shadow-2xl">
            {/* Header bar */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-4 py-3">
              <div className="min-w-0">
                <DialogPrimitive.Title className="truncate text-sm font-semibold text-white">
                  {video?.title ?? ''}
                </DialogPrimitive.Title>
                {video?.duration && (
                  <p
                    id={video ? `video-modal-desc-${video.id}` : undefined}
                    className="text-xs text-white/60"
                  >
                    {video.duration} tutorial
                  </p>
                )}
              </div>

              <DialogPrimitive.Close
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Close video"
              >
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>

            {/* Video area — 16:9 ratio */}
            <div className="relative aspect-video w-full bg-black">
              {/* Loading spinner — shown until embed fires onLoad */}
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white/40" />
                </div>
              )}

              {/* Only render the embed when the modal is open — this also
                  handles auto-pause: unmounting the iframe stops playback */}
              {video && (
                <div className={cn('h-full w-full', isLoaded ? 'opacity-100' : 'opacity-0')}>
                  <VideoEmbed video={video} onLoad={() => setIsLoaded(true)} />
                </div>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// =============================================================================
// useVideoModal — convenience hook to manage open/close state
// =============================================================================

export function useVideoModal() {
  const [activeVideo, setActiveVideo] = React.useState<TutorialVideo | null>(null);

  const openVideo = React.useCallback((video: TutorialVideo) => {
    setActiveVideo(video);
  }, []);

  const closeVideo = React.useCallback(() => {
    setActiveVideo(null);
  }, []);

  return { activeVideo, openVideo, closeVideo };
}
