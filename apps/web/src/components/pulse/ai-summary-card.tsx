'use client';

import { Sparkles, Copy, Check, MessageSquare, Share2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type SummaryTheme = string | { label: string; count?: number };

// ─── Types ───────────────────────────────────────────────────────────────────

export type ExportConfig = {
  /** Plain text summary body */
  summary: string;
  /** Theme labels and optional counts */
  themes: SummaryTheme[];
  /** Provenance line, e.g. "Summarised from 42 responses – Sprint Retro" */
  footnote?: string;
  /** Event name shown in the Slack message header */
  eventName?: string;
};

// ─── Copy-to-clipboard helper ─────────────────────────────────────────────────

function useClipboard(timeoutMs = 2000) {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeoutMs);
    } catch {
      /* silently ignore – clipboard unavailable */
    }
  }, [timeoutMs]);
  return { copied, copy };
}

// ─── Markdown builder ─────────────────────────────────────────────────────────

function buildMarkdown({ summary, themes, footnote, eventName }: ExportConfig): string {
  const lines: string[] = [];
  if (eventName) lines.push(`# 📊 ${eventName} – AI Summary`, '');
  lines.push('## What your audience is saying', '');
  if (summary) lines.push(summary, '');
  if (themes.length > 0) {
    lines.push('### Top themes', '');
    for (const t of themes) {
      const label = typeof t === 'string' ? t : t.label;
      const count = typeof t === 'string' ? undefined : t.count;
      lines.push(`- **${label}**${count != null ? ` · ${count}` : ''}`);
    }
    lines.push('');
  }
  if (footnote) lines.push(`_${footnote}_`);
  return lines.join('\n');
}

// ─── Slack deep-link builder ──────────────────────────────────────────────────

function openSlackShare(cfg: ExportConfig) {
  const text = encodeURIComponent(buildMarkdown(cfg));
  // Slack's share URL (works for Slack-connected browsers/desktop app)
  window.open(`https://slack.com/intl/en-us/help/articles/201330736-Add-a-post-to-a-channel?text=${text}`, '_blank');
}

// ─── ExportBar ────────────────────────────────────────────────────────────────

function ExportBar({ cfg }: { cfg: ExportConfig }) {
  const mdClip = useClipboard();
  const txtClip = useClipboard();

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-ai-border pt-3">
      <span className="flex items-center gap-1.5 text-xs text-ink-faint">
        <Share2 className="h-3 w-3" />
        Export
      </span>

      {/* Copy as Markdown */}
      <button
        type="button"
        onClick={() => mdClip.copy(buildMarkdown(cfg))}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
          mdClip.copied
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
            : 'border-ai-border bg-card text-ink-secondary hover:bg-ai-subtle hover:text-ai',
        )}
      >
        {mdClip.copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {mdClip.copied ? 'Copied!' : 'Copy Markdown'}
      </button>

      {/* Copy plain text */}
      <button
        type="button"
        onClick={() => txtClip.copy(cfg.summary)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
          txtClip.copied
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
            : 'border-ai-border bg-card text-ink-secondary hover:bg-ai-subtle hover:text-ai',
        )}
      >
        {txtClip.copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {txtClip.copied ? 'Copied!' : 'Copy Text'}
      </button>

      {/* Share to Slack */}
      <button
        type="button"
        onClick={() => openSlackShare(cfg)}
        className="inline-flex items-center gap-1.5 rounded-full border border-ai-border bg-card px-3 py-1 text-xs font-medium text-ink-secondary transition-all hover:bg-[#4A154B]/10 hover:border-[#4A154B]/30 hover:text-[#4A154B]"
      >
        <MessageSquare className="h-3 w-3" />
        Share to Slack
      </button>
    </div>
  );
}

// ─── AISummaryCard ────────────────────────────────────────────────────────────

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
  exportConfig,
  className,
}: {
  title?: string;
  body?: React.ReactNode;
  themes?: SummaryTheme[];
  shimmer?: boolean;
  footnote?: React.ReactNode;
  /** When provided, shows the Export toolbar below the summary */
  exportConfig?: ExportConfig;
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
          {exportConfig && !shimmer && <ExportBar cfg={exportConfig} />}
        </>
      )}
    </div>
  );
}
