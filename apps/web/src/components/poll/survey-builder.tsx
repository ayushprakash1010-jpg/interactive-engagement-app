"use client";

import { useId, useState } from "react";
import { Plus, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { apiFetch } from "@/lib/events-api";
import { notify } from "@/lib/notification-store";
import type {
  SurveyConfig,
  SurveyQuestion,
  CreateActivityPayload,
} from "../../hooks/use-activities";

const uid = () => Math.random().toString(36).slice(2, 9);

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single: "Single Choice",
  multiple: "Multiple Choice",
  rating: "Rating Scale",
  open: "Open Text",
};

const createOption = (label = "") => ({
  id: uid(),
  label,
});

const createQuestion = (): SurveyQuestion => {
  return {
    id: uid(),
    type: "single",
    text: "",
    options: [createOption("Option A"), createOption("Option B")],
    required: true,
  };
};

interface Props {
  eventId: string;
  initialConfig?: SurveyConfig & { title?: string };
  onSave: (payload: CreateActivityPayload) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function SurveyBuilder({
  initialConfig,
  onSave,
  onCancel,
  isSaving = false,
}: Props) {
  const formId = useId();
  const isEditing = Boolean(initialConfig);

  const [title, setTitle] = useState(initialConfig?.title ?? "");
  const [welcomeMessage, setWelcomeMessage] = useState(initialConfig?.welcomeMessage ?? "");
  const [thankYouMessage, setThankYouMessage] = useState(initialConfig?.thankYouMessage ?? "");
  const [displayMode, setDisplayMode] = useState<'scroll' | 'stepper'>(initialConfig?.displayMode ?? 'scroll');
  const [maxResponses, setMaxResponses] = useState(initialConfig?.maxResponses?.toString() ?? "");
  const [questions, setQuestions] = useState<SurveyQuestion[]>(
    initialConfig?.questions?.length
      ? initialConfig.questions
      : [createQuestion()],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("");

  const updateQuestion = (questionId: string, patch: Partial<SurveyQuestion>) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, ...patch } : question,
      ),
    );
  };

  const addQuestion = () => {
    const newQuestion = createQuestion();
    setQuestions((prev) => [...prev, newQuestion]);

    setTimeout(() => {
      document.getElementById(`question-${newQuestion.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((prev) =>
      prev.filter((question) => question.id !== questionId),
    );
  };

  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId && (question.options?.length ?? 0) < 10
          ? {
              ...question,
              options: [...(question.options ?? []), createOption("")],
            }
          : question,
      ),
    );
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    label: string,
  ) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: (question.options ?? []).map((option) =>
                option.id === optionId ? { ...option, label } : option,
              ),
            }
          : question,
      ),
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;
        return {
          ...question,
          options: (question.options ?? []).filter(
            (option) => option.id !== optionId,
          ),
        };
      }),
    );
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) {
      nextErrors.title = "Survey title is required";
    }

    if (questions.length === 0) {
      nextErrors.questions = "Add at least 1 question";
    }

    questions.forEach((question, index) => {
      const key = `question-${question.id}`;

      if (!question.text.trim()) {
        nextErrors[`${key}-text`] = `Question ${index + 1} text is required`;
      }

      if (question.type === "single" || question.type === "multiple") {
        const filledOptions = (question.options ?? []).filter((option) =>
          option.label.trim(),
        );
        if (filledOptions.length < 2) {
          nextErrors[`${key}-options`] =
            `Question ${index + 1} requires at least 2 options`;
        }
      }

      if (question.type === "rating") {
        const scale = question.ratingScale ?? 5;
        if (scale < 2 || scale > 10) {
          nextErrors[`${key}-rating`] = `Scale must be between 2 and 10`;
        }
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenerateWithAI = async () => {
    const topic = aiTopic.trim();

    if (!topic) return;

    try {
      setIsGenerating(true);

      let data: { questions?: any[] } | null = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          data = await apiFetch<{ questions?: any[] }>(
            "ai/generate-survey",
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

      if (!data || !Array.isArray(data.questions)) {
        throw new Error("Failed to generate survey after retries");
      }

      const generatedQuestions: SurveyQuestion[] = data.questions.map((q: any) => {
        const type = ["single", "multiple", "rating", "open"].includes(q.pollType) ? q.pollType : "single";
        return {
          id: uid(),
          type,
          text: q.title || "Untitled Question",
          options: (type === "single" || type === "multiple") && Array.isArray(q.options) 
            ? q.options.map((opt: any) => ({
                id: uid(),
                label: typeof opt === 'string' ? opt : opt?.label || ""
              }))
            : undefined,
          ratingScale: type === "rating" ? 5 : undefined,
          required: q.required ?? true
        };
      });

      if (generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
      }

      if (!title.trim()) {
        setTitle(`${topic} Survey`);
      }

      notify({
        type: "ai-poll-generated",
        description: "AI generated a survey successfully.",
        href: window.location.pathname,
      });
      setAiTopic("");
      setShowAiModal(false);
    } catch (error) {
      console.error("Survey AI generation failed:", error);
      alert("AI could not generate the survey right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedMaxResponses = parseInt(maxResponses, 10);

    const config: SurveyConfig = {
      welcomeMessage: welcomeMessage.trim() || undefined,
      thankYouMessage: thankYouMessage.trim() || undefined,
      displayMode,
      maxResponses: !isNaN(parsedMaxResponses) && parsedMaxResponses > 0 ? parsedMaxResponses : undefined,
      questions: questions.map((question) => {
        const trimmedOptions = (question.options ?? [])
          .filter((option) => option.label.trim())
          .map((option) => ({
            ...option,
            label: option.label.trim(),
          }));

        return {
          id: question.id,
          type: question.type,
          text: question.text.trim(),
          options:
            question.type === "single" || question.type === "multiple"
              ? trimmedOptions
              : undefined,
          ratingScale:
            question.type === "rating" ? question.ratingScale ?? 5 : undefined,
          required: question.required,
        };
      }),
    };

    await onSave({
      type: "survey",
      title: title.trim(),
      config,
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      <SurfacePanel tone="sunken" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Survey details
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              Configure the name and optional welcome/thank you messages.
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
          <Label htmlFor={`${formId}-title`}>Survey title</Label>
          <Input
            id={`${formId}-title`}
            placeholder="e.g. End of Event Survey"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? "border-destructive" : undefined}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-welcome`}>Welcome message (Optional)</Label>
            <Input
              id={`${formId}-welcome`}
              placeholder="e.g. Thanks for joining!"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-thank-you`}>Thank you message (Optional)</Label>
            <Input
              id={`${formId}-thank-you`}
              placeholder="e.g. Your feedback helps us improve."
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-display`}>Display mode</Label>
            <Select
              id={`${formId}-display`}
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value as 'scroll' | 'stepper')}
            >
              <option value="scroll">Scroll (All questions on one page)</option>
              <option value="stepper">Stepper (One question per page)</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-max-responses`}>Response limit (Optional)</Label>
            <Input
              id={`${formId}-max-responses`}
              type="number"
              min="1"
              placeholder="e.g. 100"
              value={maxResponses}
              onChange={(e) => setMaxResponses(e.target.value)}
            />
          </div>
        </div>
      </SurfacePanel>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Survey questions
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              Add multiple types of questions to your survey.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
          >
            <Plus className="h-4 w-4" />
            Add question
          </Button>
        </div>

        {errors.questions && (
          <p className="text-xs text-destructive">{errors.questions}</p>
        )}

        <div className="space-y-4">
          {questions.map((question, questionIndex) => {
            const key = `question-${question.id}`;

            return (
              <SurfacePanel id={key} key={question.id} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                      Question {questionIndex + 1}
                    </p>
                  </div>

                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                  <div className="space-y-1.5">
                    <Label htmlFor={`${formId}-${question.id}-text`}>
                      Question Text
                    </Label>
                    <Input
                      id={`${formId}-${question.id}-text`}
                      placeholder="What would you like to ask?"
                      value={question.text}
                      onChange={(e) =>
                        updateQuestion(question.id, { text: e.target.value })
                      }
                      className={
                        errors[`${key}-text`] ? "border-destructive" : undefined
                      }
                    />
                    {errors[`${key}-text`] && (
                      <p className="text-xs text-destructive">
                        {errors[`${key}-text`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`${formId}-${question.id}-type`}>
                      Question type
                    </Label>
                    <Select
                      id={`${formId}-${question.id}-type`}
                      value={question.type}
                      onChange={(e) => {
                        const newType = e.target.value as SurveyQuestion["type"];
                        const patch: Partial<SurveyQuestion> = { type: newType };
                        if ((newType === "single" || newType === "multiple") && (!question.options || question.options.length === 0)) {
                          patch.options = [createOption("Option A"), createOption("Option B")];
                        }
                        if (newType === "rating" && !question.ratingScale) {
                          patch.ratingScale = 5;
                        }
                        updateQuestion(question.id, patch);
                      }}
                    >
                      {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id={`${formId}-${question.id}-required`}
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        required: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-border accent-brand"
                  />
                  <Label
                    htmlFor={`${formId}-${question.id}-required`}
                    className="cursor-pointer text-sm font-normal text-ink-muted"
                  >
                    Required question
                  </Label>
                </div>

                {(question.type === "single" || question.type === "multiple") && (
                  <div className="space-y-2">
                    <div>
                      <Label>Answer options</Label>
                      <p className="mt-1 text-xs text-ink-muted">
                        Add at least two choices.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {(question.options ?? []).map((option, optionIndex) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-xs font-semibold text-ink-muted">
                            {optionIndex + 1}
                          </span>
                          <Input
                            value={option.label}
                            placeholder={`Option ${optionIndex + 1}`}
                            onChange={(e) =>
                              updateOption(question.id, option.id, e.target.value)
                            }
                            className="flex-1"
                          />
                          {(question.options ?? []).length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(question.id, option.id)}
                              aria-label="Remove option"
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {errors[`${key}-options`] && (
                      <p className="text-xs text-destructive">
                        {errors[`${key}-options`]}
                      </p>
                    )}

                    {(question.options ?? []).length < 10 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(question.id)}
                        className="mt-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add option
                      </Button>
                    )}
                  </div>
                )}

                {question.type === "rating" && (
                  <div className="space-y-2">
                    <Label htmlFor={`${formId}-${question.id}-scale`}>Scale (2 - 10)</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id={`${formId}-${question.id}-scale`}
                        type="range"
                        min={2}
                        max={10}
                        step={1}
                        value={question.ratingScale ?? 5}
                        onChange={(e) => updateQuestion(question.id, { ratingScale: Number(e.target.value) })}
                        className="flex-1 accent-brand"
                      />
                      <span className="w-8 text-center font-semibold text-brand">
                        {question.ratingScale ?? 5}
                      </span>
                    </div>
                    {errors[`${key}-rating`] && (
                      <p className="text-xs text-destructive">{errors[`${key}-rating`]}</p>
                    )}
                  </div>
                )}
              </SurfacePanel>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-1 pb-5 pt-4 backdrop-blur">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} loading={isSaving}>
          {isEditing ? "Update survey" : "Create survey"}
        </Button>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-ai-border bg-surface-card p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Generate survey with AI
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                Enter a topic and AI will draft a full survey for you.
              </p>
            </div>

            <Input
              placeholder="e.g. Workshop Registration"
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
