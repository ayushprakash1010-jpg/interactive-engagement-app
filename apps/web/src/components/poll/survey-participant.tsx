"use client";

import { useMemo, useState } from "react";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Save, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSurveySession } from "@/hooks/use-survey-session";
import type { LiveActivity, SurveyConfig, SurveyQuestion } from "@/hooks/use-activities";

interface SurveyParticipantProps {
  activity: LiveActivity;
  participantAnonId: string | null;
}

export function SurveyParticipant({ activity, participantAnonId }: SurveyParticipantProps) {
  const config = activity.config as SurveyConfig;
  const questions = config.questions ?? [];
  const displayMode = config.displayMode ?? "scroll";

  const {
    session,
    isLoadingSession,
    sessionError,
    saveAnswer,
    completeSession,
    saveStatus,
    isCompleted,
    isCompleting,
  } = useSurveySession(activity.eventId, activity._id, participantAnonId);

  // Local state to hold answers so UI updates immediately (optimistic)
  const [localAnswers, setLocalAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);

  // Merge session answers with local answers
  const answers = useMemo(() => {
    const merged: Record<string, any> = {};
    if (session?.responses) {
      session.responses.forEach((res: any) => {
        merged[res.questionId] = {
          selectedOptionIds: res.selectedOptionIds,
          textValue: res.textValue,
          ratingValue: res.ratingValue,
        };
      });
    }
    return { ...merged, ...localAnswers };
  }, [session?.responses, localAnswers]);

  if (isLoadingSession) {
    return (
      <div className="space-y-4 py-8">
        <LoadingSkeleton variant="text" className="h-6 w-48" />
        <LoadingSkeleton variant="card" className="h-40" />
      </div>
    );
  }

  if (sessionError) {
    return (
      <EmptyState
        title="Could not load survey"
        description="There was an error loading your session. Please refresh."
      />
    );
  }

  if (isCompleted || (session?.status === "completed")) {
    return (
      <SurfacePanel className="p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand mb-4" />
        <h3 className="text-xl font-display font-semibold text-foreground mb-2">
          {config.thankYouMessage || "Survey completed"}
        </h3>
        <p className="text-ink-muted">
          Your responses have been successfully submitted.
        </p>
      </SurfacePanel>
    );
  }

  if (activity.status === "closed") {
    return (
      <EmptyState
        title="Survey is closed"
        description="This survey is no longer accepting responses."
      />
    );
  }

  const handleAnswer = (questionId: string, answerPayload: any) => {
    setLocalAnswers((prev) => ({ ...prev, [questionId]: answerPayload }));
    saveAnswer(questionId, answerPayload);
  };

  const isQuestionValid = (question: SurveyQuestion) => {
    if (!question.required) return true;
    const ans = answers[question.id];
    if (!ans) return false;

    if (question.type === "single" || question.type === "multiple") {
      return ans.selectedOptionIds && ans.selectedOptionIds.length > 0;
    }
    if (question.type === "open") {
      return ans.textValue && ans.textValue.trim().length > 0;
    }
    if (question.type === "rating") {
      return typeof ans.ratingValue === "number";
    }
    return false;
  };

  const isSurveyValid = questions.every(isQuestionValid);

  const renderQuestion = (question: SurveyQuestion, index: number) => {
    const ans = answers[question.id] || {};
    const isValid = isQuestionValid(question);
    const hasAttempted = localAnswers[question.id] !== undefined;
    const showValidationError = question.required && hasAttempted && !isValid;

    return (
      <SurfacePanel key={question.id} className="p-5 sm:p-6 mb-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            Question {index + 1} {question.required && <span className="text-destructive">*</span>}
          </p>
          <h3 className="text-base font-semibold text-foreground">
            {question.text}
          </h3>
        </div>

        {question.type === "single" && (
          <div className="space-y-2">
            {(question.options || []).map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  ans.selectedOptionIds?.includes(opt.id)
                    ? "border-brand bg-brand-subtle/50"
                    : "border-border bg-surface-card hover:bg-surface-raised"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  className="h-4 w-4 shrink-0 accent-brand"
                  checked={ans.selectedOptionIds?.includes(opt.id) || false}
                  onChange={() => handleAnswer(question.id, { selectedOptionIds: [opt.id] })}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === "multiple" && (
          <div className="space-y-2">
            {(question.options || []).map((opt) => {
              const isChecked = ans.selectedOptionIds?.includes(opt.id) || false;
              return (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isChecked
                      ? "border-brand bg-brand-subtle/50"
                      : "border-border bg-surface-card hover:bg-surface-raised"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 rounded border-border accent-brand"
                    checked={isChecked}
                    onChange={() => {
                      const prevIds = ans.selectedOptionIds || [];
                      const nextIds = isChecked
                        ? prevIds.filter((id: string) => id !== opt.id)
                        : [...prevIds, opt.id];
                      handleAnswer(question.id, { selectedOptionIds: nextIds });
                    }}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {question.type === "rating" && (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: question.ratingScale || 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(question.id, { ratingValue: i + 1 })}
                className={`flex h-11 w-11 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                  ans.ratingValue === i + 1
                    ? "border-brand bg-brand text-brand-text"
                    : "border-border bg-surface-card text-foreground hover:bg-surface-raised"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {question.type === "open" && (
          <textarea
            className="min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Your answer..."
            value={ans.textValue || ""}
            onChange={(e) => handleAnswer(question.id, { textValue: e.target.value })}
          />
        )}

        {showValidationError && (
          <p className="mt-2 text-xs text-destructive">This question is required.</p>
        )}
      </SurfacePanel>
    );
  };

  const renderStatus = () => {
    return (
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        {saveStatus === 'saving' && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving...
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <Check className="h-3.5 w-3.5" />
            Saved
          </>
        )}
        {saveStatus === 'offline' && (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            Offline. Will retry...
          </>
        )}
      </div>
    );
  };

  const progressPercentage = Math.round((answers ? Object.keys(answers).length : 0) / questions.length * 100);

  if (displayMode === "stepper") {
    const currentQ = questions[currentStep];
    if (!currentQ) return null;

    return (
      <div className="flex flex-col h-full space-y-4">
        {config.welcomeMessage && currentStep === 0 && (
          <SurfacePanel className="p-5 sm:p-6 mb-4 bg-brand-subtle/20 border-brand/20">
            <h3 className="text-lg font-semibold">{config.welcomeMessage}</h3>
          </SurfacePanel>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted">
            Question {currentStep + 1} of {questions.length}
          </span>
          {renderStatus()}
        </div>
        
        <div className="h-1.5 w-full bg-surface-sunken overflow-hidden rounded-full">
          <div 
            className="h-full bg-brand transition-all duration-300"
            style={{ width: `${((currentStep) / questions.length) * 100}%` }}
          />
        </div>

        {renderQuestion(currentQ, currentStep)}

        <div className="flex justify-between mt-auto pt-4">
          <Button
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {currentStep < questions.length - 1 ? (
            <Button onClick={() => setCurrentStep((prev) => prev + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={completeSession}
              disabled={!isSurveyValid || isCompleting}
              loading={isCompleting}
            >
              Submit Survey
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Scroll mode
  return (
    <div className="flex flex-col space-y-4">
      {config.welcomeMessage && (
        <SurfacePanel className="p-5 sm:p-6 mb-2 bg-brand-subtle/20 border-brand/20">
          <h3 className="text-lg font-semibold">{config.welcomeMessage}</h3>
        </SurfacePanel>
      )}

      <div className="sticky top-[72px] z-20 flex items-center justify-between p-3 bg-surface-card border border-border rounded-lg shadow-sm">
        <div className="flex flex-col gap-1 w-2/3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Progress</span>
            <span className="text-xs font-semibold text-ink-muted">{progressPercentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-surface-sunken overflow-hidden rounded-full">
            <div 
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        {renderStatus()}
      </div>

      <div className="mt-4">
        {questions.map((q, i) => renderQuestion(q, i))}
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <Button
          onClick={completeSession}
          disabled={!isSurveyValid || isCompleting}
          loading={isCompleting}
          size="lg"
          className="w-full sm:w-auto"
        >
          Submit Survey
        </Button>
      </div>
    </div>
  );
}
