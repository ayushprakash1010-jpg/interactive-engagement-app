"use client";

import { useMemo, useState } from "react";

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
  onSubmit: (payload: SubmitPayload) => Promise<void> | void;
  disabled?: boolean;
  submitted?: boolean;
};

export function FeedbackParticipant({
  activityId,
  title,
  config,
  onSubmit,
  disabled = false,
  submitted = false,
}: FeedbackParticipantProps) {
  const [ratingValues, setRatingValues] = useState<Record<string, number>>({});
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields = useMemo(() => config.fields ?? [], [config.fields]);

  const validate = () => {
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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (submitted || disabled || isSubmitting) return;
    if (!validate()) return;

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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 space-y-2">
        {title ? (
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        ) : null}
        <p className="text-sm text-slate-600">{config.prompt}</p>
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
                      disabled={disabled || submitted || isSubmitting}
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
                        disabled || submitted || isSubmitting
                          ? "cursor-not-allowed opacity-60"
                          : "",
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
                disabled={disabled || submitted || isSubmitting}
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
          disabled={disabled || submitted || isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitted
            ? "Feedback submitted"
            : isSubmitting
            ? "Submitting..."
            : "Submit feedback"}
        </button>
      </div>
    </div>
  );
}

export default FeedbackParticipant;