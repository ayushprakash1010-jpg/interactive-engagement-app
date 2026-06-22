"use client";

import { useEffect, useMemo, useState } from "react";

type FeedbackFieldType = "rating" | "text";

export type FeedbackField = {
  id: string;
  type: FeedbackFieldType;
  label: string;
};

export type FeedbackConfig = {
  prompt: string;
  fields: FeedbackField[];
};

type SubmitPayload = {
  activityId: string;
  responses: Array<{
    fieldId: string;
    ratingValue?: number;
    textValue?: string;
  }>;
};

type FeedbackParticipantProps = {
  activityId: string;
  title?: string;
  config: FeedbackConfig;
  feedbackEndsAt?: number | null; // <--- NEW PROP
  onSubmit: (payload: SubmitPayload) => Promise<void> | void;
  disabled?: boolean;
  submitted?: boolean;
};

export function FeedbackParticipant({
  activityId,
  title,
  config,
  feedbackEndsAt = null,
  onSubmit,
  disabled = false,
  submitted = false,
}: FeedbackParticipantProps) {
  const [ratingValues, setRatingValues] = useState<Record<string, number>>({});
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  const fields = useMemo(() => config.fields ?? [], [config.fields]);

  // Timer logic
  useEffect(() => {
    if (!feedbackEndsAt) {
      setTimeLeftMs(0);
      return;
    }

    const update = () => {
      const diff = feedbackEndsAt - Date.now();
      setTimeLeftMs(Math.max(0, diff));
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [feedbackEndsAt]);

  const feedbackExpired = !!feedbackEndsAt && timeLeftMs <= 0;
  const isLocked = disabled || submitted || isSubmitting || feedbackExpired;

  const timeLabel = useMemo(() => {
    if (!feedbackEndsAt) return null;
    const totalSeconds = Math.ceil(timeLeftMs / 1000);
    const seconds = Math.max(0, totalSeconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [timeLeftMs, feedbackEndsAt]);

  const validate = (showErrors = true) => {
    const nextErrors: Record<string, string> = {};

    for (const field of fields) {
      if (field.type === "rating") {
        const value = ratingValues[field.id];
        if (!value || value < 1 || value > 5) {
          nextErrors[field.id] = "Please select a rating.";
        }
      }

      if (field.type === "text") {
        const value = textValues[field.id]?.trim();
        if (!value) {
          nextErrors[field.id] = "Please enter your feedback.";
        }
      }
    }

    if (showErrors) setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isFormValid = useMemo(() => validate(false), [fields, ratingValues, textValues]);

  const handleSubmit = async () => {
    if (submitted || isSubmitting) return;
    if (!validate(true)) return;

    const responses = fields.map((field) => {
      if (field.type === "rating") {
        return {
          fieldId: field.id,
          ratingValue: ratingValues[field.id],
        };
      }

      return {
        fieldId: field.id,
        textValue: textValues[field.id]?.trim() ?? "",
      };
    });

    try {
      setIsSubmitting(true);
      await onSubmit({
        activityId,
        responses,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-submit logic when timer hits 1.5 seconds remaining
  useEffect(() => {
    if (
      timeLeftMs > 0 &&
      timeLeftMs <= 1500 &&
      !submitted &&
      !isSubmitting &&
      isFormValid
    ) {
      handleSubmit();
    }
  }, [timeLeftMs, submitted, isSubmitting, isFormValid]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="space-y-2">
          {title ? (
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          ) : null}
          <p className="text-sm text-slate-600">{config.prompt}</p>
        </div>

        {feedbackEndsAt && (
          <div
            className="shrink-0 rounded-md border px-3 py-2 text-sm font-semibold tabular-nums"
            style={{
              borderColor: feedbackExpired ? "var(--color-error)" : "var(--color-border)",
              background: feedbackExpired ? "var(--color-error-highlight)" : "var(--color-surface-2)",
              color: feedbackExpired ? "var(--color-error)" : "var(--color-text)",
            }}
          >
            {timeLabel}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="space-y-3">
            <label className="block text-sm font-medium text-slate-900">
              {field.label}
            </label>

            {field.type === "rating" ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => {
                  const active = ratingValues[field.id] === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={isLocked}
                      onClick={() => {
                        setRatingValues((prev) => ({
                          ...prev,
                          [field.id]: value,
                        }));
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next[field.id];
                          return next;
                        });
                      }}
                      className={[
                        "inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition",
                        active
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                        isLocked ? "cursor-not-allowed opacity-60" : "",
                      ].join(" ")}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={textValues[field.id] ?? ""}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setTextValues((prev) => ({
                    ...prev,
                    [field.id]: nextValue,
                  }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next[field.id];
                    return next;
                  });
                }}
                disabled={isLocked}
                rows={4}
                placeholder="Type your response"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              />
            )}

            {errors[field.id] ? (
              <p className="text-sm text-red-600">{errors[field.id]}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLocked}
          className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitted
            ? "Feedback submitted"
            : feedbackExpired
            ? "Time is up"
            : isSubmitting
            ? "Submitting..."
            : "Submit feedback"}
        </button>
      </div>
    </div>
  );
}

export default FeedbackParticipant;