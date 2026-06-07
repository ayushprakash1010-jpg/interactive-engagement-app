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
  onSubmit: (payload: { activityId: string; words: string[] }) => void;
};

export function WordCloudParticipant({
  activity,
  hasSubmitted,
  isSubmitting = false,
  submittedWords = [],
  liveWords = [],
  onSubmit,
}: WordCloudParticipantProps) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const prompt = activity.config.prompt ?? activity.title ?? 'Share your words';
  const maxWords = activity.config.maxWordsPerParticipant ?? 5;
  const isClosed = activity.status === 'closed';

  useEffect(() => {
    setValue('');
    setSubmitting(false);
  }, [activity._id]);

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
            style={{ color: 'var(--color-primary)' }}
          >
            {isClosed ? 'Word cloud closed' : '✓ Words submitted'}
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
              Your words were submitted.
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
          background: canSubmit ? 'var(--color-primary)' : undefined,
          color: canSubmit ? '#fff' : undefined,
        }}
      >
        {submitting || isSubmitting ? 'Submitting…' : 'Submit words'}
      </Button>
    </div>
  );
}