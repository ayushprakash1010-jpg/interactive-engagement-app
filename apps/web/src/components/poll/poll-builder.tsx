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
          style={{ borderColor: errors.title ? 'var(--color-error)' : undefined }}
        />
        {errors.title && (
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-poll-type`}>Poll type</Label>
        <select
          id={`${formId}-poll-type`}
          value={pollType}
          onChange={(e) => setPollType(e.target.value as PollConfig['pollType'])}
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
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
          style={{ borderColor: errors.question ? 'var(--color-error)' : undefined }}
        />
        {errors.question && (
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>
            {errors.question}
          </p>
        )}
      </div>

      {(pollType === 'single' || pollType === 'multiple') && (
        <div className="space-y-2">
          <Label>Answer options</Label>
          <div className="space-y-2">
            {options.map((opt, index) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span
                  className="text-sm w-6 text-center shrink-0"
                  style={{ color: 'var(--color-text-muted)' }}
                >
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
                    className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--color-surface-offset)]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>
              {errors.options}
            </p>
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
              className="flex-1 accent-[var(--color-primary)]"
            />
            <span
              className="w-8 text-center font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              {ratingScale}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Participants will rate from 1 to {ratingScale}
          </p>
          {errors.ratingScale && (
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>
              {errors.ratingScale}
            </p>
          )}
        </div>
      )}

      {pollType === 'open' && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
          }}
        >
          Participants will type a free-text response. Answers appear in a live
          scrolling feed.
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
          }}
        >
          {isSaving ? 'Saving…' : isEditing ? 'Update poll' : 'Create poll'}
        </Button>
      </div>
    </form>
  );
}