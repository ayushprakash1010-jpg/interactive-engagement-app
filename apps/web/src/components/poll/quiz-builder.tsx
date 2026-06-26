"use client";

import { useId, useState } from "react";
import { Plus, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { apiFetch } from "@/lib/events-api";
import type {
  QuizConfig,
  QuizQuestion,
  CreateActivityPayload,
} from "../../hooks/use-activities";

const uid = () => Math.random().toString(36).slice(2, 9);

const createOption = (label = "") => ({
  id: uid(),
  label,
});

const createQuestion = (): QuizQuestion => {
  const optionA = createOption("Option A");
  const optionB = createOption("Option B");

  return {
    id: uid(),
    text: "",
    options: [optionA, optionB],
    correctOptionId: optionA.id,
    points: 100,
    timeLimitSec: 20,
  };
};

type GeneratedQuizQuestion = {
  question?: string;
  options?: string[];
  correctAnswer?: string;
};

interface Props {
  eventId: string;
  initialConfig?: QuizConfig & { title?: string };
  onSave: (payload: CreateActivityPayload) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function QuizBuilder({
  initialConfig,
  onSave,
  onCancel,
  isSaving = false,
}: Props) {
  const formId = useId();
  const isEditing = Boolean(initialConfig);

  const [title, setTitle] = useState(initialConfig?.title ?? "");
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialConfig?.questions?.length
      ? initialConfig.questions
      : [createQuestion()],
  );
  const [speedBonusEnabled, setSpeedBonusEnabled] = useState(
    initialConfig?.speedBonusEnabled ?? false,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(1);

  const updateQuestion = (questionId: string, patch: Partial<QuizQuestion>) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, ...patch } : question,
      ),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createQuestion()]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((prev) =>
      prev.filter((question) => question.id !== questionId),
    );
  };

  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId && question.options.length < 8
          ? {
              ...question,
              options: [...question.options, createOption("")],
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
              options: question.options.map((option) =>
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

        const nextOptions = question.options.filter(
          (option) => option.id !== optionId,
        );
        const fallbackCorrectOptionId = nextOptions[0]?.id ?? "";

        return {
          ...question,
          options: nextOptions,
          correctOptionId:
            question.correctOptionId === optionId
              ? fallbackCorrectOptionId
              : question.correctOptionId,
        };
      }),
    );
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) {
      nextErrors.title = "Activity title is required";
    }

    if (questions.length === 0) {
      nextErrors.questions = "Add at least 1 question";
    }

    questions.forEach((question, index) => {
      const key = `question-${question.id}`;

      if (!question.text.trim()) {
        nextErrors[`${key}-text`] = `Question ${index + 1} text is required`;
      }

      const filledOptions = question.options.filter((option) =>
        option.label.trim(),
      );

      if (filledOptions.length < 2) {
        nextErrors[`${key}-options`] =
          `Question ${index + 1} requires at least 2 options`;
      }

      if (
        !filledOptions.some((option) => option.id === question.correctOptionId)
      ) {
        nextErrors[`${key}-correct`] =
          `Question ${index + 1} must have a correct answer`;
      }

      if (!Number.isInteger(question.points) || question.points < 1) {
        nextErrors[`${key}-points`] =
          `Question ${index + 1} points must be at least 1`;
      }

      if (
        !Number.isInteger(question.timeLimitSec) ||
        question.timeLimitSec < 5 ||
        question.timeLimitSec > 120
      ) {
        nextErrors[`${key}-time`] =
          `Question ${index + 1} timer must be between 5 and 120 seconds`;
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

      let data: { questions?: GeneratedQuizQuestion[] } | null = null;
      let lastError = "";

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          data = await apiFetch<{ questions?: GeneratedQuizQuestion[] }>(
            "ai/generate-quiz",
            {
              method: "POST",
              body: JSON.stringify({
                topic,
                count: questionCount,
              }),
            },
          );
          break;
        } catch (error) {
          lastError =
            error instanceof Error ? error.message : "Network request failed";
        }

        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
        }
      }

      if (!data) {
        throw new Error(lastError || "Quiz generation failed after retries");
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("AI returned no quiz questions");
      }

      const generatedQuestions: QuizQuestion[] = data.questions.map(
        (question: {
          question?: string;
          options?: string[];
          correctAnswer?: string;
        }) => {
          const generatedOptions =
            Array.isArray(question.options) && question.options.length >= 2
              ? question.options.map((label: string) => createOption(label))
              : [
                  createOption("Option A"),
                  createOption("Option B"),
                  createOption("Option C"),
                  createOption("Option D"),
                ];

          const correctOption =
            generatedOptions.find(
              (option) =>
                option.label.trim().toLowerCase() ===
                (question.correctAnswer ?? "").trim().toLowerCase(),
            ) ?? generatedOptions[0];

          return {
            id: uid(),
            text: question.question?.trim() ?? "",
            options: generatedOptions,
            correctOptionId: correctOption?.id ?? "",
            points: 100,
            timeLimitSec: 20,
          };
        },
      );

      setQuestions(generatedQuestions);

      if (!title.trim()) {
        setTitle(`${topic} Quiz`);
      }

      setAiTopic("");
      setShowAiModal(false);
    } catch (error) {
      console.error("Quiz AI generation error:", error);
      alert("Failed to generate quiz after 3 attempts. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const config: QuizConfig = {
      questions: questions.map((question) => {
        const trimmedOptions = question.options
          .filter((option) => option.label.trim())
          .map((option) => ({
            ...option,
            label: option.label.trim(),
          }));

        const fallbackCorrectOptionId = trimmedOptions[0]?.id ?? "";
        const correctOptionExists = trimmedOptions.some(
          (option) => option.id === question.correctOptionId,
        );

        return {
          ...question,
          text: question.text.trim(),
          options: trimmedOptions,
          correctOptionId: correctOptionExists
            ? question.correctOptionId
            : fallbackCorrectOptionId,
          points: Number(question.points),
          timeLimitSec: Number(question.timeLimitSec),
        };
      }),
      speedBonusEnabled,
    };

    await onSave({
      type: "quiz",
      title: title.trim(),
      config,
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6 pb-2">
      <SurfacePanel tone="sunken" className="space-y-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">
            Activity setup
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            Name the quiz and decide whether fast correct answers get rewarded.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-title`}>Activity title</Label>
          <Input
            id={`${formId}-title`}
            placeholder="e.g. Product knowledge quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? "border-destructive" : undefined}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        <label
          htmlFor={`${formId}-speed-bonus`}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-card p-4 transition hover:bg-surface-raised"
        >
          <input
            id={`${formId}-speed-bonus`}
            type="checkbox"
            checked={speedBonusEnabled}
            onChange={(e) => setSpeedBonusEnabled(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
          />
          <span className="space-y-0.5">
            <span className="block text-sm font-medium text-foreground">
              Speed bonus
            </span>
            <span className="block text-xs text-ink-muted">
              Award extra points for fast correct answers, scaled by the time
              remaining when they answer.
            </span>
          </span>
        </label>
      </SurfacePanel>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Quiz questions
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              Build the sequence, mark the correct answer, and set scoring.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ai"
              size="sm"
              onClick={() => setShowAiModal(true)}
              disabled={isGenerating}
              loading={isGenerating}
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>

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
        </div>

        {errors.questions && (
          <p className="text-xs text-destructive">{errors.questions}</p>
        )}

        <div className="space-y-4">
          {questions.map((question, questionIndex) => {
            const key = `question-${question.id}`;

            return (
              <SurfacePanel key={question.id} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                      Question {questionIndex + 1}
                    </p>
                    <h4 className="mt-1 font-display text-base font-semibold text-foreground">
                      {question.text || "Untitled question"}
                    </h4>
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

                <div className="space-y-1.5">
                  <Label htmlFor={`${formId}-${question.id}-text`}>
                    Question
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`${formId}-${question.id}-points`}>
                      Points
                    </Label>
                    <Input
                      id={`${formId}-${question.id}-points`}
                      type="number"
                      min={1}
                      step={1}
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          points: Number(e.target.value),
                        })
                      }
                      className={
                        errors[`${key}-points`]
                          ? "border-destructive"
                          : undefined
                      }
                    />
                    {errors[`${key}-points`] && (
                      <p className="text-xs text-destructive">
                        {errors[`${key}-points`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`${formId}-${question.id}-timer`}>
                      Timer (seconds)
                    </Label>
                    <Input
                      id={`${formId}-${question.id}-timer`}
                      type="number"
                      min={5}
                      max={120}
                      step={1}
                      value={question.timeLimitSec}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          timeLimitSec: Number(e.target.value),
                        })
                      }
                      className={
                        errors[`${key}-time`] ? "border-destructive" : undefined
                      }
                    />
                    {errors[`${key}-time`] && (
                      <p className="text-xs text-destructive">
                        {errors[`${key}-time`]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label>Answer options</Label>
                    <p className="mt-1 text-xs text-ink-muted">
                      Select the correct answer with the radio button.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`${formId}-${question.id}-correct`}
                          checked={question.correctOptionId === option.id}
                          onChange={() =>
                            updateQuestion(question.id, {
                              correctOptionId: option.id,
                            })
                          }
                          className="shrink-0 accent-brand"
                          aria-label={`Mark option ${optionIndex + 1} as correct`}
                        />
                        <Input
                          value={option.label}
                          placeholder={`Option ${optionIndex + 1}`}
                          onChange={(e) =>
                            updateOption(question.id, option.id, e.target.value)
                          }
                          className="flex-1"
                        />
                        {question.options.length > 2 && (
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

                  {errors[`${key}-correct`] && (
                    <p className="text-xs text-destructive">
                      {errors[`${key}-correct`]}
                    </p>
                  )}

                  {question.options.length < 8 && (
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
              </SurfacePanel>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-1 pt-4 backdrop-blur">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} loading={isSaving}>
          {isEditing ? "Update quiz" : "Create quiz"}
        </Button>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-ai-border bg-surface-card p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Generate quiz with AI
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                Enter a topic and choose how many questions to draft.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-ai-topic`}>Topic</Label>
                <Input
                  id={`${formId}-ai-topic`}
                  placeholder="Enter quiz topic..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-ai-count`}>
                  Number of questions
                </Label>
                <Select
                  id={`${formId}-ai-count`}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  disabled={isGenerating}
                >
                  <option value={1}>1 question</option>
                  <option value={5}>5 questions</option>
                  <option value={10}>10 questions</option>
                  <option value={15}>15 questions</option>
                </Select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAiModal(false)}
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
