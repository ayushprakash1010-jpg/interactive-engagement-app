"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Eyebrow } from "@/components/pulse";
import { cn } from "@/lib/utils";
import type { LiveActivity, WordCloudEntry } from "@/hooks/use-poll";
import { WordCloud } from "@/components/wordcloud/wordcloud-cloud";
import { limitWordCloudWords, normalizeWordCloudInput } from "@/lib/wordcloud";

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
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(0); // Timer state

  const prompt = activity.config.prompt ?? activity.title ?? "Share your words";
  const maxWords = activity.config.maxWordsPerParticipant ?? 5;

  // Sync component state
  useEffect(() => {
    setValue("");
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
  const isClosed = activity.status === "closed" || timeExpired;

  const timeLabel = useMemo(() => {
    if (!wordCloudEndsAt) return null;
    const totalSeconds = Math.ceil(timeLeftMs / 1000);
    const seconds = Math.max(0, totalSeconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [timeLeftMs, wordCloudEndsAt]);

  const parsedWords = useMemo(() => normalizeWordCloudInput(value), [value]);
  const limitedWords = useMemo(
    () => limitWordCloudWords(parsedWords, maxWords),
    [parsedWords, maxWords],
  );

  const tooManyWords = parsedWords.length > maxWords;

  const hasValidData = limitedWords.length > 0 && !tooManyWords;

  const canSubmit =
    !submitting &&
    !isSubmitting &&
    !hasSubmitted &&
    !isClosed &&
    hasValidData;

  const handleSubmit = (force = false) => {
    if (!canSubmit && !force) return;

    setSubmitting(true);
    onSubmit({
      activityId: activity._id,
      words: limitedWords,
    });
  };

  const autoSubmitRef = useRef({
    canSubmit: false,
    submitFn: () => {},
  });

  useEffect(() => {
    autoSubmitRef.current = {
      canSubmit: !submitting && !isSubmitting && !hasSubmitted && hasValidData,
      submitFn: () => handleSubmit(true),
    };
  });

  useEffect(() => {
    return () => {
      const state = autoSubmitRef.current;
      if (state.canSubmit) {
        state.submitFn();
      }
    };
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftMs, hasSubmitted, submitting, isSubmitting, canSubmit]);

  if (hasSubmitted || isClosed) {
    return (
      <div className="space-y-4">
        <SurfacePanel tone="raised" className="p-4">
          {hasSubmitted ? (
            <Badge variant="success" className="mb-2">
              Words submitted
            </Badge>
          ) : timeExpired ? (
            <Badge variant="destructive" className="mb-2">
              Time is up
            </Badge>
          ) : (
            <Badge variant="neutral" className="mb-2">
              Word cloud closed
            </Badge>
          )}
          <p className="font-display font-semibold tracking-tight text-foreground">
            {prompt}
          </p>
        </SurfacePanel>

        <SurfacePanel tone="raised" className="p-4">
          <Eyebrow className="mb-3">Your submission</Eyebrow>

          {submittedWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {submittedWords.map((word) => (
                <span
                  key={word}
                  className="rounded-full bg-brand-subtle px-3 py-1 text-sm font-medium text-brand-subtle-text"
                >
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <EmptyState
              className="py-8"
              title={
                isClosed && !hasSubmitted
                  ? "No words submitted"
                  : "Words submitted"
              }
              description={
                isClosed && !hasSubmitted
                  ? "No words were submitted before this activity closed."
                  : "Your words were submitted."
              }
            />
          )}
        </SurfacePanel>

        {isClosed ? (
          <SurfacePanel tone="raised" className="p-4">
            <Eyebrow className="mb-3">Live word cloud</Eyebrow>
            <WordCloud
              words={liveWords}
              height={280}
              emptyMessage="No word cloud responses were received."
            />
          </SurfacePanel>
        ) : (
          <EmptyState
            title="Waiting for word cloud"
            description="The live word cloud will appear here once the host closes the activity."
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
            {prompt}
          </p>
          <p className="mt-1 text-sm text-ink-secondary">
            Enter up to {maxWords} unique word{maxWords === 1 ? "" : "s"},
            separated by commas or new lines.
          </p>
        </div>

        {wordCloudEndsAt && timeLabel && (
          <div
            className={cn(
              "shrink-0 rounded-sm px-3 py-1.5 text-sm font-semibold tabular-nums",
              timeExpired
                ? "bg-error-subtle text-destructive"
                : "bg-brand-subtle text-brand-subtle-text",
            )}
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
        className="min-h-[140px] bg-surface-raised"
      />

      <div
        className={cn(
          "rounded-lg border p-4",
          tooManyWords
            ? "border-destructive bg-error-subtle"
            : "border-border bg-surface-raised",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p
            className={cn(
              "text-sm font-medium",
              tooManyWords ? "text-destructive" : "text-ink-secondary",
            )}
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
                className="rounded-full bg-brand-subtle px-3 py-1 text-sm font-medium text-brand-subtle-text"
              >
                {word}
              </span>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        onClick={() => handleSubmit()}
        disabled={!canSubmit}
        size="lg"
        className="w-full"
      >
        {submitting || isSubmitting ? "Submitting…" : "Submit your words"}
      </Button>
    </div>
  );
}
