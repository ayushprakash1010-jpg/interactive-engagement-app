"use client";

import { useId, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { apiFetch } from "@/lib/events-api";
import type {
  PollConfig,
  CreateActivityPayload,
} from "../../hooks/use-activities";

const uid = () => Math.random().toString(36).slice(2, 9);

const POLL_TYPE_LABELS: Record<string, string> = {
  single: "Single Choice",
  multiple: "Multiple Choice",
  rating: "Rating Scale",
  open: "Open Text",
};

const DEFAULT_OPTIONS = [
  { id: uid(), label: "Option A" },
  { id: uid(), label: "Option B" },
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

  const [title, setTitle] = useState(initialConfig?.title ?? "");
  const [pollType, setPollType] = useState<PollConfig["pollType"]>(
    initialConfig?.pollType ?? "single",
  );
  const [question, setQuestion] = useState(initialConfig?.question ?? "");
  const [options, setOptions] = useState<{ id: string; label: string }[]>(
    initialConfig?.options?.length
      ? initialConfig.options
      : DEFAULT_OPTIONS.map((o) => ({ ...o })),
  );
  const [ratingScale, setRatingScale] = useState(
    initialConfig?.ratingScale ?? 5,
  );
  const [timeLimitSec, setTimeLimitSec] = useState<number>(
    initialConfig?.timeLimitSec ?? 0,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("");

  const addOption = () =>
    setOptions((prev) => [...prev, { id: uid(), label: "" }]);

  const updateOption = (id: string, label: string) =>
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, label } : o)));

  const removeOption = (id: string) =>
    setOptions((prev) => prev.filter((o) => o.id !== id));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) errs.title = "Activity title is required";
    if (!question.trim()) errs.question = "Question text is required";

    if (pollType === "single" || pollType === "multiple") {
      const filled = options.filter((o) => o.label.trim());
      if (filled.length < 2) errs.options = "Add at least 2 options";
    }

    if (pollType === "rating" && (ratingScale < 2 || ratingScale > 10)) {
      errs.ratingScale = "Scale must be between 2 and 10";
    }

    if (timeLimitSec !== 0 && (timeLimitSec < 5 || timeLimitSec > 600)) {
      errs.timeLimitSec =
        "Time limit must be between 5 and 600 seconds (or 0 for no limit)";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerateWithAI = async () => {
    const topic = aiTopic.trim();

    if (!topic) return;

    try {
      setIsGenerating(true);

      let data: { question?: string; options?: unknown[] } | null = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          data = await apiFetch<{ question?: string; options?: unknown[] }>(
            "ai/generate-poll",
            {
              method: "POST",
              body: JSON.stringify({ topic }),
            },
          );
          break;
        } catch (error) {
          if (attempt === 3) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }

      if (!data) {
        throw new Error("Failed to generate poll after retries");
      }

      setPollType("single");
      setQuestion(data.question ?? "");

      const generatedOptions = Array.isArray(data.options)
        ? data.options
            .filter(
              (label: unknown): label is string =>
                typeof label === "string" && label.trim().length > 0,
            )
            .map((label: string) => ({
              id: uid(),
              label: label.trim(),
            }))
        : [];

      if (generatedOptions.length >= 2) {
        setOptions(generatedOptions);
      }

      if (!title.trim()) {
        setTitle(`${topic} Poll`);
      }

      setAiTopic("");
      setShowAiModal(false);
    } catch (error) {
      console.error("Poll AI generation failed:", error);
      alert("AI could not generate the poll right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const config: PollConfig = {
      pollType,
      question: question.trim(),
      options:
        pollType === "single" || pollType === "multiple"
          ? options.filter((o) => o.label.trim())
          : [],
      ratingScale: pollType === "rating" ? ratingScale : undefined,
      timeLimitSec: timeLimitSec > 0 ? timeLimitSec : undefined,
    };

    await onSave({
      type: "poll",
      title: title.trim(),
      config,
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      <SurfacePanel tone="sunken" className="space-y-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">
            Activity setup
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            Name the poll and choose how participants can answer.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-title`}>Activity title</Label>
            <Input
              id={`${formId}-title`}
              placeholder="e.g. Kick-off poll"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-destructive" : undefined}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-poll-type`}>Poll type</Label>
            <Select
              id={`${formId}-poll-type`}
              value={pollType}
              onChange={(e) =>
                setPollType(e.target.value as PollConfig["pollType"])
              }
            >
              {Object.entries(POLL_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </SurfacePanel>

      <SurfacePanel className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Prompt
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              This is the question your audience will see live.
            </p>
          </div>

          <Button
            type="button"
            variant="ai"
            size="sm"
            onClick={() => setShowAiModal(true)}
            disabled={isGenerating || isSaving}
            loading={isGenerating}
          >
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-question`}>Question</Label>
          <Input
            id={`${formId}-question`}
            placeholder="What would you like to ask?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className={errors.question ? "border-destructive" : undefined}
          />
          {errors.question && (
            <p className="text-xs text-destructive">{errors.question}</p>
          )}
        </div>
      </SurfacePanel>

      {(pollType === "single" || pollType === "multiple") && (
        <SurfacePanel className="space-y-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Answer options
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              Add at least two choices. Empty options are ignored on save.
            </p>
          </div>

          <div className="space-y-2">
            {options.map((opt, index) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-xs font-semibold text-ink-muted">
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
                    <X className="h-4 w-4" />
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
              <Plus className="h-4 w-4" />
              Add option
            </Button>
          )}
        </SurfacePanel>
      )}

      {pollType === "rating" && (
        <SurfacePanel className="space-y-2">
          <Label htmlFor={`${formId}-scale`}>Scale (2 - 10)</Label>
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
        </SurfacePanel>
      )}

      {pollType === "open" && (
        <SurfacePanel tone="sunken" className="text-sm text-ink-muted">
          Your audience will type a free-text response. Answers appear in a live
          scrolling feed.
        </SurfacePanel>
      )}

      <SurfacePanel tone="sunken" className="space-y-1.5">
        <Label htmlFor={`${formId}-time-limit`}>Time limit (seconds)</Label>
        <Input
          id={`${formId}-time-limit`}
          type="number"
          min="0"
          max="600"
          placeholder="0 for no limit"
          value={timeLimitSec || ""}
          onChange={(e) => setTimeLimitSec(Number(e.target.value) || 0)}
          className={errors.timeLimitSec ? "border-destructive" : undefined}
        />
        <p className="text-xs text-ink-muted">
          Set to 0 to leave the poll open until you close it.
        </p>
        {errors.timeLimitSec && (
          <p className="text-xs text-destructive">{errors.timeLimitSec}</p>
        )}
      </SurfacePanel>

      <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-1 pt-4 backdrop-blur">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} loading={isSaving}>
          {isEditing ? "Update poll" : "Create poll"}
        </Button>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-ai-border bg-surface-card p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Generate poll with AI
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                Enter a topic and AI will draft a question with options.
              </p>
            </div>

            <Input
              placeholder="Enter poll topic..."
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              disabled={isGenerating}
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAiModal(false);
                  setAiTopic("");
                }}
                disabled={isGenerating}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="ai"
                disabled={!aiTopic.trim() || isGenerating}
                onClick={handleGenerateWithAI}
                loading={isGenerating}
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
