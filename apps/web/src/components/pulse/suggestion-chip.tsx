'use client';

import { Sparkles, Check, X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * A single AI suggestion the host can accept — a drafted question, a
 * follow-up poll, a moderation action. Iris-tinted with accept/dismiss.
 */
export function SuggestionChip({
  text,
  icon,
  onAccept,
  onDismiss,
  className,
}: {
  text: React.ReactNode;
  icon?: React.ReactNode;
  onAccept?: () => void;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-full border border-ai-border bg-card py-2 pl-3.5 pr-2',
        className,
      )}
    >
      <span className="inline-flex shrink-0 text-ai">
        {icon ?? <Sparkles className="h-[15px] w-[15px]" />}
      </span>
      <span className="flex-1 text-sm leading-snug text-foreground">{text}</span>
      <div className="flex shrink-0 gap-1">
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {onAccept && (
          <button
            type="button"
            onClick={onAccept}
            aria-label="Accept"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ai text-white transition-colors hover:bg-ai-hover"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
