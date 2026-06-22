'use client';

import { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PollConfig, CreateActivityPayload } from '../../hooks/use-activities';

const uid = () => Math.random().toString(36).slice(2, 9);

const POLL_TYPE_LABELS: Record<string, string> = {
  single: 'Single Choice',
  multiple: 'Multiple Choice',
  rating: 'Rating Scale',
  open: 'Open Text',
};

const DEFAULT_OPTIONS = [
  { id: uid(), label: 'Option A' },
  { id: uid(), label: 'Option B' },
];

interface Props {
  eventId: string;
  initialConfig?: PollConfig & { title?: string };
  onSave: (payload: CreateActivityPayload) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function PollBuilder({
  initialConfig,
  onSave,
  onCancel,
  isSaving = false,
}: Props) {
  const formId = useId();
  const isEditing = Boolean(initialConfig);

  const [title, setTitle] = useState(initialConfig?.title ?? '');
  const [pollType, setPollType] = useState<PollConfig['pollType']>(
    initialConfig?.pollType ?? 'single',
  );
  const [question, setQuestion] = useState(initialConfig?.question ?? '');
  const [options, setOptions] = useState<{ id: string; label: string }[]>(
    initialConfig?.options?.length
      ? initialConfig.options
      : DEFAULT_OPTIONS.map((o) => ({ ...o })),
  );
  const [ratingScale, setRatingScale] = useState(initialConfig?.ratingScale ?? 5);
  const [timeLimitSec, setTimeLimitSec] = useState<number>(initialConfig?.timeLimitSec ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addOption = () =>
    setOptions((prev) => [...prev, { id: uid(), label: '' }]);

  const updateOption = (id: string, label: string) =>
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, label } : o)),
    );

  const removeOption = (id: string) =>
    setOptions((prev) => prev.filter((o) => o.id !== id));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) errs.title = 'Activity title is required';
    if (!question.trim()) errs.question = 'Question text is required';

    if (pollType === 'single' || pollType === 'multiple') {
      const filled = options.filter((o) => o.label.trim());
      if (filled.length < 2) errs.options = 'Add at least 2 options';
    }

    if (pollType === 'rating' && (ratingScale < 2 || ratingScale > 10)) {
      errs.ratingScale = 'Scale must be between 2 and 10';
    }

    if (timeLimitSec !== 0 && (timeLimitSec < 5 || timeLimitSec > 600)) {
      errs.timeLimitSec = 'Time limit must be between 5 and 600 seconds (or 0 for no limit)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const config: PollConfig = {
      pollType,
      question: question.trim(),
      options:
        pollType === 'single' || pollType === 'multiple'
          ? options.filter((o) => o.label.trim())
          : [],
      ratingScale: pollType === 'rating' ? ratingScale : undefined,
      timeLimitSec: timeLimitSec > 0 ? timeLimitSec : undefined,
    };

    await onSave({
      type: 'poll',
      title: title.trim(),
      config,
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-title`}>Activity title</Label>
        <Input
          id={`${formId}-title`}
          placeholder="e.g. Kick-off poll"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={errors.title ? 'border-destructive' : undefined}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-poll-type`}>Poll type</Label>
        <select
          id={`${formId}-poll-type`}
          value={pollType}
          onChange={(e) => setPollType(e.target.value as PollConfig['pollType'])}
          className="flex h-10 w-full rounded-md border border-border bg-surface-card px-3 py-2 text-sm text-foreground"
        >
          {Object.entries(POLL_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-question`}>Question</Label>
        <Input
          id={`${formId}-question`}
          placeholder="What would you like to ask?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={errors.question ? 'border-destructive' : undefined}
        />
        {errors.question && (
          <p className="text-xs text-destructive">{errors.question}</p>
        )}
      </div>

      {(pollType === 'single' || pollType === 'multiple') && (
        <div className="space-y-2">
          <Label>Answer options</Label>
          <div className="space-y-2">
            {options.map((opt, index) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-center text-sm text-ink-muted">
                  {index + 1}
                </span>
                <Input
                  value={opt.label}
                  placeholder={`Option ${index + 1}`}
                  onChange={(e) => updateOption(opt.id, e.target.value)}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id)}
                    aria-label="Remove option"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="text-xs text-destructive">{errors.options}</p>
          )}
          {options.length < 8 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-1"
            >
              + Add option
            </Button>
          )}
        </div>
      )}

      {pollType === 'rating' && (
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-scale`}>Scale (2 – 10)</Label>
          <div className="flex items-center gap-3">
            <input
              id={`${formId}-scale`}
              type="range"
              min={2}
              max={10}
              step={1}
              value={ratingScale}
              onChange={(e) => setRatingScale(Number(e.target.value))}
              className="flex-1 accent-brand"
            />
            <span className="w-8 text-center font-semibold text-brand">
              {ratingScale}
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            Your audience will rate from 1 to {ratingScale}
          </p>
          {errors.ratingScale && (
            <p className="text-xs text-destructive">{errors.ratingScale}</p>
          )}
        </div>
      )}

      {pollType === 'open' && (
        <div className="rounded-lg border border-border bg-surface-sunken px-4 py-3 text-sm text-ink-muted">
          Your audience will type a free-text response. Answers appear in a live
          scrolling feed.
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-time-limit`}>Time limit (seconds)</Label>
        <Input
          id={`${formId}-time-limit`}
          type="number"
          min="0"
          max="600"
          placeholder="0 for no limit"
          value={timeLimitSec || ''}
          onChange={(e) => setTimeLimitSec(Number(e.target.value) || 0)}
          className={errors.timeLimitSec ? 'border-destructive' : undefined}
        />
        <p className="text-xs text-ink-muted">
          Set to 0 to leave the poll open until you close it.
        </p>
        {errors.timeLimitSec && (
          <p className="text-xs text-destructive">{errors.timeLimitSec}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : isEditing ? 'Update poll' : 'Create poll'}
        </Button>
      </div>
    </form>
  );
}