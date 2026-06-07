'use client';

import { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
  WordCloudConfig,
  CreateActivityPayload,
} from '../../hooks/use-activities';

// Keep in sync with @iep/types wordcloudConfigSchema (min 1, max 20, default 3).
const MIN_WORDS = 1;
const MAX_WORDS = 20;
const DEFAULT_WORDS = 3;

interface Props {
  eventId: string;
  initialConfig?: WordCloudConfig & { title?: string };
  onSave: (payload: CreateActivityPayload) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function WordCloudBuilder({
  initialConfig,
  onSave,
  onCancel,
  isSaving = false,
}: Props) {
  const formId = useId();
  const isEditing = Boolean(initialConfig);

  const [title, setTitle] = useState(initialConfig?.title ?? '');
  const [prompt, setPrompt] = useState(initialConfig?.prompt ?? '');
  const [maxWords, setMaxWords] = useState(
    initialConfig?.maxWordsPerParticipant ?? DEFAULT_WORDS,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) errs.title = 'Activity title is required';
    if (!prompt.trim()) errs.prompt = 'Prompt is required';
    if (maxWords < MIN_WORDS || maxWords > MAX_WORDS) {
      errs.maxWords = `Limit must be between ${MIN_WORDS} and ${MAX_WORDS}`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const config: WordCloudConfig = {
      prompt: prompt.trim(),
      maxWordsPerParticipant: maxWords,
    };

    await onSave({
      type: 'wordcloud',
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
          placeholder="e.g. One word for today"
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
        <Label htmlFor={`${formId}-prompt`}>Prompt</Label>
        <Textarea
          id={`${formId}-prompt`}
          placeholder="What should participants describe in a word or two?"
          value={prompt}
          rows={3}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ borderColor: errors.prompt ? 'var(--color-error)' : undefined }}
        />
        {errors.prompt && (
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>
            {errors.prompt}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-max-words`}>
          Words per participant ({MIN_WORDS} – {MAX_WORDS})
        </Label>
        <div className="flex items-center gap-3">
          <input
            id={`${formId}-max-words`}
            type="range"
            min={MIN_WORDS}
            max={MAX_WORDS}
            step={1}
            value={maxWords}
            onChange={(e) => setMaxWords(Number(e.target.value))}
            className="flex-1 accent-[var(--color-primary)]"
          />
          <span
            className="w-8 text-center font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            {maxWords}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Each participant can submit up to {maxWords} unique word
          {maxWords === 1 ? '' : 's'}. Repeated words across participants grow in
          size on the cloud.
        </p>
        {errors.maxWords && (
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>
            {errors.maxWords}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          style={{
            background: '#0f172a',
            color: '#fff',
          }}
        >
          {isSaving
            ? 'Saving…'
            : isEditing
            ? 'Update word cloud'
            : 'Create word cloud'}
        </Button>
      </div>
    </form>
  );
}

export default WordCloudBuilder;
