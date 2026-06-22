"use client";

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";

type FeedbackFieldType = "rating" | "text";

export type FeedbackField = {
  id: string;
  type: FeedbackFieldType;
  label: string;
};

export type FeedbackConfig = {
  prompt: string;
  fields: FeedbackField[];
  timeLimitSec?: number; // <--- Added timer field
};

type FeedbackBuilderProps = {
  value: FeedbackConfig;
  onChange: (next: FeedbackConfig) => void;
  disabled?: boolean;
};

const createField = (type: FeedbackFieldType): FeedbackField => ({
  id: crypto.randomUUID(),
  type,
  label: type === "rating" ? "How would you rate this session?" : "Share your feedback",
});

export function FeedbackBuilder({
  value,
  onChange,
  disabled = false,
}: FeedbackBuilderProps) {
  const fields = useMemo(() => value.fields ?? [], [value.fields]);

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
        field.id === fieldId ? { ...field, ...patch } : field
      ),
    });
  };

  const removeField = (fieldId: string) => {
    onChange({
      ...value,
      fields: fields.filter((field) => field.id !== fieldId),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Feedback prompt
        </label>
        <textarea
          value={value.prompt}
          onChange={(e) => updatePrompt(e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="What would you like your audience to give feedback on?"
          className="w-full rounded-md border border-border bg-surface-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-subtle disabled:cursor-not-allowed disabled:opacity-60"
        />
        <p className="text-xs text-ink-muted">
          This prompt appears above the participant feedback form.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">Fields</h3>
            <p className="text-xs text-ink-muted">
              Add rating and text inputs for your audience.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addField("rating")}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-card px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add rating
            </button>

            <button
              type="button"
              onClick={() => addField("text")}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-card px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add text
            </button>
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-sunken px-4 py-6 text-sm text-ink-muted">
            No feedback fields added yet. Add at least one rating or text field.
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-border bg-surface-card p-4 shadow-sm"
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

                  <button
                    type="button"
                    onClick={() => removeField(field.id)}
                    disabled={disabled}
                    className="inline-flex items-center gap-2 rounded-md border border-destructive/30 bg-surface-card px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Label
                  </label>
                  <input
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
                    className="w-full rounded-md border border-border bg-surface-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-subtle disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Time limit (seconds)
        </label>
        <input
          type="number"
          min="5"
          max="600"
          value={value.timeLimitSec ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              timeLimitSec: e.target.value ? parseInt(e.target.value, 10) : undefined,
            })
          }
          disabled={disabled}
          placeholder="e.g. 60 (optional)"
          className="w-full rounded-md border border-border bg-surface-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-subtle disabled:cursor-not-allowed disabled:opacity-60"
        />
        <p className="text-xs text-ink-muted">
          Leave empty to keep the feedback form open until you close it.
        </p>
      </div>
    </div>
  );
}

export default FeedbackBuilder;