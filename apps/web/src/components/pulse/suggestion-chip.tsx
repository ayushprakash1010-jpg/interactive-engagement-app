'use client';

import { Sparkles, Check, X, Pencil, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * A single AI suggestion the host can accept — a drafted question, a
 * follow-up poll, a moderation action. Iris-tinted with accept/dismiss.
 */
export function SuggestionChip({
  text,
  icon,
  activityDetails,
  onAccept,
  onDismiss,
  onTweak,
  className,
}: {
  text: React.ReactNode;
  icon?: React.ReactNode;
  activityDetails?: { type: string; config?: Record<string, unknown> };
  onAccept?: () => void;
  onDismiss?: () => void;
  onTweak?: (instruction: string) => void;
  className?: string;
}) {
  const [isTweaking, setIsTweaking] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [tweakText, setTweakText] = React.useState('');

  const handleTweakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tweakText.trim() && onTweak) {
      onTweak(tweakText.trim());
      setIsTweaking(false);
      setTweakText('');
    }
  };

  const renderConfigPreview = () => {
    if (!activityDetails?.config) return null;
    const { type, config } = activityDetails;

    if (type === 'quiz') {
      const questions = Array.isArray(config.questions) ? config.questions : [];
      return (
        <div className="space-y-3">
          {questions.map((q: any, i: number) => (
            <div key={q.id || i} className="text-xs">
              <span className="font-semibold text-foreground">Q{i + 1}: {q.text || q.question}</span>
              <ul className="mt-1 space-y-0.5 pl-4 text-ink-muted">
                {Array.isArray(q.options) && q.options.map((opt: any, j: number) => (
                  <li key={opt.id || j} className={cn(
                    "flex items-center gap-1.5",
                    opt.id === q.correctOptionId ? "font-medium text-emerald-500" : ""
                  )}>
                    <span className="h-1 w-1 rounded-full bg-current opacity-50" />
                    {opt.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'poll') {
      return (
        <div className="text-xs">
          <span className="font-semibold text-foreground">Q: {config.question as string}</span>
          {Array.isArray(config.options) && config.options.length > 0 && (
             <ul className="mt-1 space-y-0.5 pl-4 text-ink-muted">
              {config.options.map((opt: any, j: number) => (
                <li key={opt.id || j} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-current opacity-50" />
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    if (type === 'wordcloud') {
      return (
        <div className="text-xs">
          <span className="font-semibold text-foreground">Prompt: {config.prompt as string}</span>
          <p className="mt-1 text-ink-muted">Max {config.maxWordsPerParticipant as number} words per participant</p>
        </div>
      );
    }

    if (type === 'feedback') {
      const fields = Array.isArray(config.fields) ? config.fields : [];
      return (
        <div className="text-xs">
          <span className="font-semibold text-foreground">Prompt: {config.prompt as string}</span>
          <ul className="mt-1 space-y-0.5 pl-4 text-ink-muted">
            {fields.map((f: any, i: number) => (
              <li key={f.id || i} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-current opacity-50" />
                {f.label} ({f.type})
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (type === 'survey') {
      const questions = Array.isArray(config.questions) ? config.questions : [];
      return (
        <div className="space-y-3">
          {questions.map((q: any, i: number) => (
            <div key={q.id || i} className="text-xs">
              <span className="font-semibold text-foreground">Q{i + 1}: {q.text || q.title}</span>
              {Array.isArray(q.options) && q.options.length > 0 && (
                <ul className="mt-1 space-y-0.5 pl-4 text-ink-muted">
                  {q.options.map((opt: any, j: number) => (
                    <li key={opt.id || j} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-current opacity-50" />
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback for any unknown type
    return (
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-surface-sunken p-2 text-[10px] text-ink-muted">
        {JSON.stringify(config, null, 2)}
      </pre>
    );
  };

  return (
    <div className="flex flex-col gap-2">
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
          {activityDetails && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label="Toggle Details"
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-muted",
                isExpanded ? "bg-ai/10 text-ai" : "text-ink-faint"
              )}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          {onTweak && (
            <button
              type="button"
              onClick={() => setIsTweaking(!isTweaking)}
              aria-label="Tweak"
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-muted",
                isTweaking ? "bg-ai/10 text-ai" : "text-ink-faint"
              )}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
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
      
      {isExpanded && activityDetails && (
        <div className="ml-6 mr-2 rounded-xl border border-border bg-surface-card/50 p-3 shadow-inner">
          {renderConfigPreview()}
        </div>
      )}

      {isTweaking && (
        <form onSubmit={handleTweakSubmit} className="ml-6 flex items-center gap-2 rounded-full border border-ai-border bg-card/50 py-1 pl-3 pr-1 shadow-inner">
          <input
            type="text"
            value={tweakText}
            onChange={(e) => setTweakText(e.target.value)}
            placeholder="How should we change this? (e.g. 'Make it funnier')"
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-ink-muted"
            autoFocus
          />
          <button
            type="submit"
            disabled={!tweakText.trim()}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ai text-white transition-colors hover:bg-ai-hover disabled:bg-muted disabled:text-ink-faint"
          >
            <ArrowRight className="h-3 w-3" />
          </button>
        </form>
      )}
    </div>
  );
}
