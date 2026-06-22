'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { LiveActivity, WordCloudEntry } from '@/hooks/use-poll';
import { WordCloud } from '@/components/wordcloud/wordcloud-cloud';
import { limitWordCloudWords, normalizeWordCloudInput } from '@/lib/wordcloud';

type WordCloudParticipantProps = {
  activity: LiveActivity;
  hasSubmitted: boolean;
  isSubmitting?: boolean;
  submittedWords?: string[];
  liveWords?: WordCloudEntry[];
  wordCloudEndsAt?: number | null; // <--- Add timer prop
  onSubmit: (payload: { activityId: string; words: string[] }) => void;
};

export function WordCloudParticipant({
  activity,
  hasSubmitted,
  isSubmitting = false,
  submittedWords = [],
  liveWords = [],
  wordCloudEndsAt = null,
  onSubmit,
}: WordCloudParticipantProps) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(0); // Timer state

  const prompt = activity.config.prompt ?? activity.title ?? 'Share your words';
  const maxWords = activity.config.maxWordsPerParticipant ?? 5;

  // Sync component state
  useEffect(() => {
    setValue('');
    setSubmitting(false);
  }, [activity._id]);

  // Tick the timer
  useEffect(() => {
    if (!wordCloudEndsAt) {
      setTimeLeftMs(0);
      return;
    }

    const update = () => {
      const diff = wordCloudEndsAt - Date.now();
      setTimeLeftMs(Math.max(0, diff));
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [wordCloudEndsAt]);

  const timeExpired = !!wordCloudEndsAt && timeLeftMs <= 0;
  const isClosed = activity.status === 'closed' || timeExpired;

  const timeLabel = useMemo(() => {
    if (!wordCloudEndsAt) return null;
    const totalSeconds = Math.ceil(timeLeftMs / 1000);
    const seconds = Math.max(0, totalSeconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeftMs, wordCloudEndsAt]);

  const parsedWords = useMemo(() => normalizeWordCloudInput(value), [value]);
  const limitedWords = useMemo(
    () => limitWordCloudWords(parsedWords, maxWords),
    [parsedWords, maxWords],
  );

  const tooManyWords = parsedWords.length > maxWords;
  
  const canSubmit =
    !submitting &&
    !isSubmitting &&
    !hasSubmitted &&
    !isClosed &&
    limitedWords.length > 0 &&
    !tooManyWords;

  const handleSubmit = () => {
    if (!canSubmit) return;

    setSubmitting(true);
    onSubmit({
      activityId: activity._id,
      words: limitedWords,
    });
  };

  // Auto-submit logic when timer hits 1.5 seconds remaining
  useEffect(() => {
    if (
      timeLeftMs > 0 &&
      timeLeftMs <= 1500 &&
      !hasSubmitted &&
      !submitting &&
      !isSubmitting &&
      canSubmit
    ) {
      handleSubmit();
    }
  }, [timeLeftMs, hasSubmitted, submitting, isSubmitting, canSubmit]);

  if (hasSubmitted || isClosed) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <p
            className="mb-1 text-sm font-medium"
            style={{ color: timeExpired && !hasSubmitted ? 'var(--color-error)' : 'var(--color-primary)' }}
          >
            {hasSubmitted ? '✓ Words submitted' : timeExpired ? 'Time is up' : 'Word cloud closed'}
          </p>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
            {prompt}
          </p>
        </div>

        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <p
            className="mb-3 text-sm font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Your submission
          </p>

          {submittedWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {submittedWords.map((word) => (
                <span
                  key={word}
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{
                    background: 'var(--color-primary-highlight)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {isClosed && !hasSubmitted ? "No words were submitted." : "Your words were submitted."}
            </p>
          )}
        </div>

        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <p
            className="mb-3 text-sm font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Live word cloud
          </p>
          <WordCloud
            words={liveWords}
            height={280}
            emptyMessage={
              isClosed
                ? 'No word cloud responses were received.'
                : 'Waiting for responses…'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-lg font-semibold leading-snug"
            style={{ color: 'var(--color-text)' }}
          >
            {prompt}
          </p>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Enter up to {maxWords} unique word{maxWords === 1 ? '' : 's'}, separated by commas or new lines.
          </p>
        </div>

        {wordCloudEndsAt && (
          <div
            className="shrink-0 rounded-md border px-3 py-2 text-sm font-semibold tabular-nums"
            style={{
              borderColor: timeExpired ? 'var(--color-error)' : 'var(--color-border)',
              background: timeExpired ? 'var(--color-error-highlight)' : 'var(--color-surface-2)',
              color: timeExpired ? 'var(--color-error)' : 'var(--color-text)',
            }}
          >
            {timeLabel}
          </div>
        )}
      </div>

      <Textarea
        placeholder="Example: innovation, growth, teamwork"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        maxLength={300}
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
        }}
      />

      <div
        className="rounded-lg border p-4"
        style={{
          borderColor: tooManyWords ? 'var(--color-error)' : 'var(--color-border)',
          background: tooManyWords
            ? 'var(--color-error-highlight)'
            : 'var(--color-surface)',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <p
            className="text-sm font-medium"
            style={{
              color: tooManyWords
                ? 'var(--color-error)'
                : 'var(--color-text-muted)',
            }}
          >
            {tooManyWords
              ? `Too many words. Limit is ${maxWords}.`
              : `${limitedWords.length}/${maxWords} selected`}
          </p>
        </div>

        {limitedWords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {limitedWords.map((word) => (
              <span
                key={word}
                className="rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  background: 'var(--color-primary-highlight)',
                  color: 'var(--color-primary)',
                }}
              >
                {word}
              </span>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full"
        style={{
          background: canSubmit ? '#000000' : undefined,
          color: canSubmit ? '#FFFFFF' : undefined,
        }}
      >
        {submitting || isSubmitting ? 'Submitting…' : 'Submit words'}
      </Button>
    </div>
  );
}