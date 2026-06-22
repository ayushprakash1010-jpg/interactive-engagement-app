'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AI prompt composer — "describe it, Pulse drafts it." A rounded iris-tinted
 * field with a sparkle, optional suggestion chips, and a generate button.
 */
export function AIComposer({
  value,
  onChange,
  onGenerate,
  placeholder = 'Describe your session — Pulse drafts the activities…',
  suggestions = [],
  loading = false,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onGenerate: () => void;
  placeholder?: string;
  suggestions?: string[];
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-ai-border bg-ai-subtle p-4',
        className,
      )}
    >
      <div className="flex items-start gap-2.5 rounded-md border border-ai-border bg-card px-3.5 py-3">
        <Sparkles className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ai" />
        <textarea
          rows={2}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 resize-none border-none bg-transparent text-sm leading-normal text-foreground outline-none placeholder:text-ink-muted"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(s)}
              className="rounded-full border border-dashed border-ai-border bg-card px-3 py-[0.3125rem] text-xs font-medium text-ai-subtle-text transition-colors hover:bg-ai-subtle"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || !value.trim()}
          className="inline-flex h-10 items-center gap-2 rounded-sm bg-ai px-[1.125rem] text-sm font-semibold text-white transition-colors hover:bg-ai-hover disabled:cursor-not-allowed disabled:bg-ai-border"
        >
          <Sparkles className={cn('h-[15px] w-[15px]', loading && 'animate-spin')} />
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </div>
  );
}
