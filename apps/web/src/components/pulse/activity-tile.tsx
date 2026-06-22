'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ActivityType = 'poll' | 'quiz' | 'wordcloud' | 'qa' | 'feedback' | 'ai';

const TONES: Record<ActivityType, string> = {
  poll: 'text-data-1 bg-[color-mix(in_srgb,var(--data-1)_12%,white)]',
  quiz: 'text-data-4 bg-[color-mix(in_srgb,var(--data-4)_14%,white)]',
  wordcloud: 'text-data-7 bg-[color-mix(in_srgb,var(--data-7)_12%,white)]',
  qa: 'text-data-6 bg-[color-mix(in_srgb,var(--data-6)_12%,white)]',
  feedback: 'text-data-3 bg-[color-mix(in_srgb,var(--data-3)_14%,white)]',
  ai: 'text-ai bg-ai-subtle',
};

/**
 * Activity-type tile for the builder ("Add a poll / quiz / word cloud…").
 * Pass a Lucide icon node. Each activity type gets its own tone.
 */
export function ActivityTile({
  icon,
  title,
  description,
  type = 'poll',
  onClick,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  type?: ActivityType;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full flex-col items-start gap-3 rounded-lg border border-border bg-card p-5 text-left shadow-sm transition-all duration-base ease-standard hover:-translate-y-0.5 hover:border-brand hover:shadow-md',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-md',
          TONES[type],
        )}
      >
        {icon}
      </span>
      <span className="font-display text-lg font-semibold text-foreground">{title}</span>
      {description && (
        <span className="text-sm leading-snug text-ink-muted">{description}</span>
      )}
    </button>
  );
}
