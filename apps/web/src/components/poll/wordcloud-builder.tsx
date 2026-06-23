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
  // Add timer state
  const [timeLimitSec, setTimeLimitSec] = useState<number | ''>(
    initialConfig?.timeLimitSec ?? ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

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
      ...(timeLimitSec !== '' ? { timeLimitSec } : {}), // Add timer to config
    };

    await onSave({
      type: 'wordcloud',
      title: title.trim(),
      config,
    });
  };

  const handleGenerateWithAI = async () => {
  const topic = aiTopic.trim();

  if (!topic) return;

  const maxAttempts = 3;

  try {
    setIsGenerating(true);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(
          'http://localhost:4000/ai/generate-wordcloud',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic }),
          },
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.words) || data.words.length === 0) {
          throw new Error('AI did not return word cloud suggestions');
        }

        setTitle(`${topic} Word Cloud`);

        setPrompt(
          `What words or short phrases come to mind when you think about ${topic}?`,
        );

        setMaxWords(Math.min(Math.max(data.words.length, 1), 10));

        setAiTopic('');
        setShowAiModal(false);

        return;
      } catch (error) {
        console.warn(`AI word cloud attempt ${attempt} failed`, error);

        if (attempt === maxAttempts) {
          throw error;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 1200),
        );
      }
    }
  } catch (error) {
    console.error(error);
    alert('AI word cloud generation failed after 3 attempts. Please try again.');
  } finally {
    setIsGenerating(false);
  }
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
          className={errors.title ? 'border-destructive' : undefined}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
  <div className="flex items-center justify-between gap-3">
    <Label htmlFor={`${formId}-prompt`}>Prompt</Label>

    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setShowAiModal(true)}
      disabled={isGenerating || isSaving}
    >
      {isGenerating ? 'Generating…' : '✨ Generate with AI'}
    </Button>
  </div>
        <Textarea
          id={`${formId}-prompt`}
          placeholder="What should participants describe in a word or two?"
          value={prompt}
          rows={3}
          onChange={(e) => setPrompt(e.target.value)}
          className={errors.prompt ? 'border-destructive' : undefined}
        />
        {errors.prompt && (
          <p className="text-xs text-destructive">{errors.prompt}</p>
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
            className="flex-1 accent-brand"
          />
          <span className="w-8 text-center font-semibold text-brand">
            {maxWords}
          </span>
        </div>
        <p className="text-xs text-ink-muted">
          Each participant can submit up to {maxWords} unique word
          {maxWords === 1 ? '' : 's'}. Repeated words across your audience grow in
          size on the cloud.
        </p>
        {errors.maxWords && (
          <p className="text-xs text-destructive">{errors.maxWords}</p>
        )}
      </div>

      {/* Timer Input Field */}
      <div className="space-y-1.5">
        <Label htmlFor={`${formId}-timer`}>Time limit (seconds)</Label>
        <Input
          id={`${formId}-timer`}
          type="number"
          min="5"
          max="600"
          placeholder="e.g. 60 (optional)"
          value={timeLimitSec}
          onChange={(e) =>
            setTimeLimitSec(e.target.value ? parseInt(e.target.value, 10) : '')
          }
        />
        <p className="text-xs text-ink-muted">
          Leave empty to keep the word cloud open until you close it.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? 'Saving…'
            : isEditing
            ? 'Update word cloud'
            : 'Create word cloud'}
        </Button>
      </div>

      {showAiModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-xl bg-surface-card p-6 shadow-xl">
      <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
        Generate Word Cloud with AI
      </h3>

      <p className="mb-4 text-sm text-ink-muted">
        Enter a topic and AI will create a title and participant prompt.
      </p>

      <Input
        placeholder="e.g. Cybersecurity Awareness"
        value={aiTopic}
        onChange={(e) => setAiTopic(e.target.value)}
        disabled={isGenerating}
      />

      <div className="mt-5 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isGenerating}
          onClick={() => {
            setShowAiModal(false);
            setAiTopic('');
          }}
        >
          Cancel
        </Button>

        <Button
          type="button"
          disabled={!aiTopic.trim() || isGenerating}
          onClick={handleGenerateWithAI}
        >
          {isGenerating ? 'Generating…' : 'Generate'}
        </Button>
      </div>
    </div>
  </div>
)}
    </form>
  );
}

export default WordCloudBuilder;