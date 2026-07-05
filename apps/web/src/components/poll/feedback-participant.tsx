"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

  const isFormValid = useMemo(
    () => validate(false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields, ratingValues, textValues],
  );

  const handleSubmit = async (force = false) => {
    if (submitted || isSubmitting) return;
    if (!validate(!force)) return; // don't show errors on force submit

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

  const autoSubmitRef = useRef({
    canSubmit: false,
    submitFn: () => {},
  });

  useEffect(() => {
    autoSubmitRef.current = {
      canSubmit: !submitted && !isSubmitting && isFormValid,
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
      !submitted &&
      !isSubmitting &&
      isFormValid
    ) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftMs, submitted, isSubmitting, isFormValid]);

  return (
    <SurfacePanel className="p-5 sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="space-y-1">
          {title ? (
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          ) : null}
          <p className="text-sm text-ink-secondary">{config.prompt}</p>
        </div>

        {feedbackEndsAt && timeLabel && (
          <div
            className={cn(
              "shrink-0 rounded-sm px-3 py-1.5 text-sm font-semibold tabular-nums",
              feedbackExpired
                ? "bg-error-subtle text-destructive"
                : "bg-brand-subtle text-brand-subtle-text",
            )}
          >
            {timeLabel}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
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
                      className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums shadow-xs transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-border bg-surface-raised text-foreground hover:bg-muted",
                        isLocked ? "cursor-not-allowed opacity-60" : "",
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            ) : (
              <Textarea
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
                className="min-h-[128px] bg-surface-raised"
              />
            )}

            {errors[field.id] ? (
              <p className="text-sm text-destructive">{errors[field.id]}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isLocked}
          size="lg"
          className="w-full"
        >
          {submitted
            ? "Feedback submitted"
            : feedbackExpired
              ? "Time is up"
              : isSubmitting
                ? "Submitting…"
                : "Submit feedback"}
        </Button>
      </div>
    </SurfacePanel>
  );
}

export default FeedbackParticipant;
