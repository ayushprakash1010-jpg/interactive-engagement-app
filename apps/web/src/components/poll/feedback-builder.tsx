"use client";

import { useMemo, useState } from "react";
import { MessageSquareText, Plus, Sparkles, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/events-api";

type FeedbackFieldType = "rating" | "text";

export type FeedbackField = {
  id: string;
  type: FeedbackFieldType;
  label: string;
};

export type FeedbackConfig = {
  prompt: string;
  fields: FeedbackField[];
  timeLimitSec?: number;
};

type FeedbackBuilderProps = {
  value: FeedbackConfig;
  onChange: (next: FeedbackConfig) => void;
  disabled?: boolean;
};

const createField = (type: FeedbackFieldType): FeedbackField => ({
  id: crypto.randomUUID(),
  type,
  label:
    type === "rating"
      ? "How would you rate this session?"
      : "Share your feedback",
});

export function FeedbackBuilder({
  value,
  onChange,
  disabled = false,
}: FeedbackBuilderProps) {
  const fields = useMemo(() => value.fields ?? [], [value.fields]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("");

  const updatePrompt = (prompt: string) => {
    onChange({
      ...value,
      prompt,
    });
  };

  const addField = (type: FeedbackFieldType) => {
    onChange({
      ...value,
      fields: [...fields, createField(type)],
    });
  };

  const updateField = (fieldId: string, patch: Partial<FeedbackField>) => {
    onChange({
      ...value,
      fields: fields.map((field) =>
        field.id === fieldId ? { ...field, ...patch } : field,
      ),
    });
  };

  const removeField = (fieldId: string) => {
    onChange({
      ...value,
      fields: fields.filter((field) => field.id !== fieldId),
    });
  };

  const handleGenerateWithAI = async () => {
    const topic = aiTopic.trim();

    if (!topic) return;

    try {
      setIsGenerating(true);

      const data = await apiFetch<{ question?: string }>(
        "ai/generate-feedback",
        {
          method: "POST",
          body: JSON.stringify({ topic }),
        },
      );

      onChange({
        ...value,
        prompt: data.question ?? "",
        fields: [
          {
            id: crypto.randomUUID(),
            type: "rating",
            label: "How would you rate this session?",
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            label: "Additional comments",
          },
        ],
      });

      setAiTopic("");
      setShowAiModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to generate feedback");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <SurfacePanel className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Prompt
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              This appears above the participant feedback form.
            </p>
          </div>

          <Button
            type="button"
            variant="ai"
            size="sm"
            onClick={() => setShowAiModal(true)}
            disabled={disabled || isGenerating}
            loading={isGenerating}
          >
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="feedback-prompt">Feedback prompt</Label>
          <Textarea
            id="feedback-prompt"
            value={value.prompt}
            onChange={(e) => updatePrompt(e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="What would you like your audience to give feedback on?"
          />
        </div>
      </SurfacePanel>

      <SurfacePanel tone="sunken" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Fields
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              Add rating and text inputs for your audience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addField("rating")}
              disabled={disabled}
            >
              <Star className="h-4 w-4" />
              Add rating
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addField("text")}
              disabled={disabled}
            >
              <MessageSquareText className="h-4 w-4" />
              Add text
            </Button>
          </div>
        </div>

        {fields.length === 0 ? (
          <EmptyState
            icon={<Plus className="h-5 w-5" />}
            title="No feedback fields yet"
            description="Add at least one rating or text field before saving."
            className="bg-background py-8"
          />
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-border bg-surface-card p-4 shadow-xs transition-colors hover:bg-surface-raised"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Field {index + 1}
                    </p>
                    <p className="text-xs capitalize text-ink-muted">
                      {field.type} field
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(field.id)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`feedback-field-${field.id}`}>Label</Label>
                  <Input
                    id={`feedback-field-${field.id}`}
                    type="text"
                    value={field.label}
                    onChange={(e) =>
                      updateField(field.id, { label: e.target.value })
                    }
                    disabled={disabled}
                    placeholder={
                      field.type === "rating"
                        ? "Rate this activity"
                        : "Tell us what you think"
                    }
                  />
                </div>

                <div className="mt-3 rounded-md bg-surface-sunken px-3 py-2 text-xs text-ink-secondary">
                  {field.type === "rating"
                    ? "Participant input: 1 to 5 rating selection."
                    : "Participant input: free-text response."}
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfacePanel>

      <SurfacePanel tone="sunken" className="space-y-1.5">
        <Label htmlFor="feedback-time-limit">Time limit (seconds)</Label>
        <Input
          id="feedback-time-limit"
          type="number"
          min="5"
          max="600"
          value={value.timeLimitSec ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              timeLimitSec: e.target.value
                ? parseInt(e.target.value, 10)
                : undefined,
            })
          }
          disabled={disabled}
          placeholder="e.g. 60 (optional)"
        />

        <p className="text-xs text-ink-muted">
          Leave empty to keep the feedback form open until you close it.
        </p>
      </SurfacePanel>

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-ai-border bg-surface-card p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Generate feedback with AI
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                Enter a topic and AI will draft a feedback prompt.
              </p>
            </div>

            <Input
              type="text"
              placeholder="Enter feedback topic..."
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
    </div>
  );
}

export default FeedbackBuilder;
