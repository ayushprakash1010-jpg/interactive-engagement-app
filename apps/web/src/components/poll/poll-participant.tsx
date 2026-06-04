// apps/web/src/components/poll/poll-participant.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PollResultsChart } from './poll-results-chart';
import type { LiveActivity, UsePollReturn } from '../../hooks/use-poll';

interface Props {
  activity: LiveActivity;
  tallies: UsePollReturn['tallies'];
  hasSubmitted: boolean;
  onSubmit: UsePollReturn['submitResponse'];
}

export function PollParticipant({ activity, tallies, hasSubmitted, onSubmit }: Props) {
  const config = activity.config;
  const pollType = config.pollType ?? 'single';
  const options = config.options ?? [];
  const ratingScale = config.ratingScale ?? 5;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [textValue, setTextValue] = useState('');
  const [ratingValue, setRatingValue] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isClosed = activity.status === 'closed';
  const showResults = hasSubmitted || isClosed;

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (submitting || hasSubmitted) return;

    setSubmitting(true);
    onSubmit({
      activityId: activity._id,
      selectedOptionIds:
        pollType === 'single' || pollType === 'multiple'
          ? selectedIds
          : undefined,
      textValue: pollType === 'open' ? textValue : undefined,
      ratingValue: pollType === 'rating' ? (ratingValue ?? undefined) : undefined,
    });
  };

  const canSubmit = (() => {
    if (submitting || hasSubmitted || isClosed) return false;
    if (pollType === 'single') return selectedIds.length === 1;
    if (pollType === 'multiple') return selectedIds.length > 0;
    if (pollType === 'rating') return ratingValue !== null;
    if (pollType === 'open') return textValue.trim().length > 0;
    return false;
  })();

  // ── After submission — show live results ──────────────────────────────────

  if (showResults) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-4"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <p className="text-sm font-medium mb-1"
            style={{ color: 'var(--color-primary)' }}>
            {isClosed ? 'Poll closed' : '✓ Response submitted'}
          </p>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
            {config.question}
          </p>
        </div>
        {tallies ? (
          <PollResultsChart tallies={tallies} />
        ) : (
          <p className="text-sm text-center py-8"
            style={{ color: 'var(--color-text-muted)' }}>
            Waiting for results…
          </p>
        )}
      </div>
    );
  }

  // ── Input UI per poll type ────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Question */}
      <p className="text-lg font-semibold leading-snug"
        style={{ color: 'var(--color-text)' }}>
        {config.question}
      </p>

      {/* Single choice */}
      {pollType === 'single' && (
        <fieldset className="space-y-2">
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors"
              style={{
                borderColor: selectedIds.includes(opt.id)
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                background: selectedIds.includes(opt.id)
                  ? 'var(--color-primary-highlight)'
                  : 'var(--color-surface)',
              }}
            >
              <input
                type="radio"
                name="single-choice"
                value={opt.id}
                checked={selectedIds.includes(opt.id)}
                onChange={() => setSelectedIds([opt.id])}
                className="accent-[var(--color-primary)]"
              />
              <span style={{ color: 'var(--color-text)' }}>{opt.label}</span>
            </label>
          ))}
        </fieldset>
      )}

      {/* Multiple choice */}
      {pollType === 'multiple' && (
        <fieldset className="space-y-2">
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors"
              style={{
                borderColor: selectedIds.includes(opt.id)
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                background: selectedIds.includes(opt.id)
                  ? 'var(--color-primary-highlight)'
                  : 'var(--color-surface)',
              }}
            >
              <input
                type="checkbox"
                value={opt.id}
                checked={selectedIds.includes(opt.id)}
                onChange={(e) =>
                  setSelectedIds((prev) =>
                    e.target.checked
                      ? [...prev, opt.id]
                      : prev.filter((id) => id !== opt.id),
                  )
                }
                className="accent-[var(--color-primary)]"
              />
              <span style={{ color: 'var(--color-text)' }}>{opt.label}</span>
            </label>
          ))}
        </fieldset>
      )}

      {/* Rating */}
      {pollType === 'rating' && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: ratingScale }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRatingValue(n)}
              className="w-11 h-11 rounded-lg border font-semibold transition-colors text-sm"
              style={{
                borderColor: ratingValue === n ? 'var(--color-primary)' : 'var(--color-border)',
                background: ratingValue === n ? 'var(--color-primary)' : 'var(--color-surface)',
                color: ratingValue === n ? '#fff' : 'var(--color-text)',
              }}
              aria-label={`Rate ${n}`}
              aria-pressed={ratingValue === n}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Open text */}
      {pollType === 'open' && (
        <Textarea
          placeholder="Type your response…"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          rows={4}
          maxLength={500}
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        />
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full"
        style={{
          background: canSubmit ? 'var(--color-primary)' : undefined,
          color: canSubmit ? '#fff' : undefined,
        }}
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </Button>
    </div>
  );
}