import { Sparkles } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type SummaryTheme = string | { label: string; count?: number };

/**
 * AI insight / summary card — distills open responses, Q&A themes, or
 * sentiment into a short readout. `shimmer` shows the generating state.
 * Always show provenance via `footnote` (e.g. "Summarized from 142 responses").
 */
export function AISummaryCard({
  title = 'AI summary',
  body,
  themes = [],
  shimmer = false,
  footnote,
  className,
}: {
  title?: string;
  body?: React.ReactNode;
  themes?: SummaryTheme[];
  shimmer?: boolean;
  footnote?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-ai-border bg-ai-subtle p-5',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-ai" />
        <span className="text-sm font-semibold text-ai-subtle-text">{title}</span>
      </div>

      {shimmer ? (
        <div className="mt-0.5 flex flex-col gap-2">
          {[100, 92, 78].map((w) => (
            <span
              key={w}
              className="h-3 rounded-full pulse-shimmer"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      ) : (
        <>
          {body && (
            <p className="text-sm leading-relaxed text-ink-secondary">{body}</p>
          )}
          {themes.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {themes.map((t, i) => {
                const label = typeof t === 'string' ? t : t.label;
                const count = typeof t === 'string' ? undefined : t.count;
                return (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ai" />
                    <span>
                      <span className="font-semibold">{label}</span>
                      {count != null && (
                        <span className="font-mono text-xs text-ink-faint"> · {count}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {footnote && (
            <p className="mt-0.5 text-2xs text-ink-faint">{footnote}</p>
          )}
        </>
      )}
    </div>
  );
}
