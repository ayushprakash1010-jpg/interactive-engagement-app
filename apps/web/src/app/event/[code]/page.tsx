"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { HelpCircle, MessageCircle, Radio, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { ConnectionStatus } from "@/components/connection-status";
import { useEventRealtime } from "@/lib/use-event-realtime";
import { usePoll } from "@/hooks/use-poll";
import { PollParticipant } from "@/components/poll/poll-participant";
import { QuizParticipant } from "@/components/poll/quiz-participant";
import { WordCloudParticipant } from "@/components/poll/wordcloud-participant";
import { PollResultsChart } from "@/components/poll/poll-results-chart";
import { QaTab } from "@/components/participant/qa-tab";
import { FeedbackParticipant } from "@/components/poll/feedback-participant";
import { SurveyParticipant } from "@/components/poll/survey-participant";
import { getAnonId } from "@/lib/anon-id";
import {
  Eyebrow,
  JoinCode,
  LeaderboardRow,
  Logomark,
} from "@/components/pulse";
import { FloatingReactions } from "@/components/reactions/floating-reactions";
import { ReactionBar } from "@/components/reactions/reaction-bar";
import { useZoomApp } from "@/components/zoom/ZoomProvider";

function AnimatedTransition({ children, transitionKey }: { children: React.ReactNode; transitionKey: string }) {
  return (
    <motion.div
      key={transitionKey}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}

function getVotedQuestionIds(code: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(`iep_voted_questions:${code}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setVotedQuestionIds(code: string, questionIds: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `iep_voted_questions:${code}`,
    JSON.stringify(questionIds),
  );
}

type ParticipantTab = "activity" | "qa";

type FeedbackParticipantConfig = {
  prompt: string;
  fields: Array<{
    id: string;
    type: "rating" | "text";
    label: string;
  }>;
};

export default function EventPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? "").toUpperCase();

  const [isMounted, setIsMounted] = useState(false);
  const [anonId, setAnonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ParticipantTab>("activity");
  const [votedQuestionIds, setLocalVotedQuestionIds] = useState<string[]>([]);
  const { isZoom } = useZoomApp();

  useEffect(() => {
    setIsMounted(true);
    setAnonId(getAnonId());
    setLocalVotedQuestionIds(getVotedQuestionIds(code));
  }, [code]);

  const {
    count,
    error,
    approvedQuestions,
    allowAnonymousQA,
    askQuestion,
    upvoteQuestion,
    sendReaction,
  } = useEventRealtime(code, "participant");

  const {
    activeActivity,
    tallies,
    pollEndsAt,
    hasSubmitted,
    submitResponse,
    submitFeedbackResponse,
    quizQuestion,
    hasAnsweredQuiz,
    quizAnswerState,
    quizLeaderboard,
    submitQuizAnswer,
    wordCloudWords,
    submittedWordCloudWords,
    submitWordCloudWords,
  } = usePoll(anonId);

  const sortedApprovedQuestions = useMemo(() => {
    return [...approvedQuestions].sort((a, b) => {
      if (b.voteCount !== a.voteCount) {
        return b.voteCount - a.voteCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [approvedQuestions]);

  if (!isMounted) {
    return (
      <main className="flex min-h-screen flex-col bg-surface-canvas px-4 py-5 sm:py-6">
        <div className="mx-auto flex w-full max-w-container-sm flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-card px-3 py-2.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Logomark size={28} />
              <JoinCode code={code} size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ConnectionStatus />
            </div>
          </header>

          <SurfacePanel className="mt-6 space-y-4">
            <LoadingSkeleton variant="text" className="h-5 w-36" />
            <LoadingSkeleton variant="card" className="h-44" />
            <LoadingSkeleton
              variant="text"
              className="h-11 w-full rounded-sm"
            />
          </SurfacePanel>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-canvas px-4 py-10 text-center">
        <div className="mx-auto w-full max-w-container-sm">
          <EmptyState
            tone="destructive"
            icon={<HelpCircle className="h-6 w-6" />}
            title="Can't join this session"
            description={error}
            action={
              <Button asChild size="lg">
                <Link href="/join">Try another code</Link>
              </Button>
            }
          />
        </div>
      </main>
    );
  }

  const hasQuizLeaderboard = quizLeaderboard.length > 0;
  const hasQuizState = Boolean(
    (activeActivity && activeActivity.type === "quiz") ||
    quizQuestion ||
    hasQuizLeaderboard,
  );

  const showWaitingState = !activeActivity && !hasQuizState;

  const showPollInput =
    activeActivity &&
    activeActivity.type === "poll" &&
    activeActivity.status === "live" &&
    !hasSubmitted;

  // Only show results when the poll is actually closed by the host or timer expired.
  // hasSubmitted alone must NOT reveal results — that breaks anonymity and host control.
  const showPollSubmitted =
    activeActivity &&
    activeActivity.type === "poll" &&
    activeActivity.status === "live" &&
    hasSubmitted;

  const showPollResults =
    activeActivity &&
    activeActivity.type === "poll" &&
    activeActivity.status === "closed";

  const showQuizWaiting =
    activeActivity &&
    activeActivity.type === "quiz" &&
    activeActivity.status === "live" &&
    !quizQuestion;

  const showQuizQuestion =
    activeActivity &&
    activeActivity.type === "quiz" &&
    activeActivity.status === "live" &&
    quizQuestion;

  const showQuizClosed = !showQuizQuestion && hasQuizLeaderboard;

  const showWordCloudInput =
    activeActivity &&
    activeActivity.type === "wordcloud" &&
    activeActivity.status === "live" &&
    !hasSubmitted;

  const showWordCloudSubmitted =
    activeActivity &&
    activeActivity.type === "wordcloud" &&
    (hasSubmitted || activeActivity.status === "closed");

  const showFeedbackInput =
    activeActivity &&
    activeActivity.type === "feedback" &&
    activeActivity.status === "live" &&
    !hasSubmitted;

  const showFeedbackSubmitted =
    activeActivity &&
    activeActivity.type === "feedback" &&
    (hasSubmitted || activeActivity.status === "closed");

  const showSurveyInput =
    activeActivity &&
    activeActivity.type === "survey";

  function handleAskQuestion(payload: { text: string; displayName?: string }) {
    askQuestion(payload);
  }

  function handleUpvoteQuestion(questionId: string) {
    if (votedQuestionIds.includes(questionId)) return;

    const nextIds = [...votedQuestionIds, questionId];
    setLocalVotedQuestionIds(nextIds);
    setVotedQuestionIds(code, nextIds);

    upvoteQuestion({ questionId });
  }

  function handleFeedbackSubmit(payload: {
    activityId: string;
    responses: Array<{
      fieldId: string;
      ratingValue?: number;
      textValue?: string;
    }>;
  }) {
    submitFeedbackResponse({
      activityId: payload.activityId,
      feedbackAnswers: payload.responses.map((answer) => ({
        fieldId: answer.fieldId,
        type: answer.ratingValue !== undefined ? "rating" : "text",
        ratingValue: answer.ratingValue,
        textValue: answer.textValue,
      })),
    });
  }

  return (
    <main className="flex min-h-screen flex-col bg-surface-canvas px-4 py-5 sm:py-6">
      <FloatingReactions />
      <div className="mx-auto flex w-full max-w-container-sm flex-1 flex-col">
        {!isZoom && (
          <header className="sticky top-3 z-10 flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-card/95 px-3 py-2.5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2.5">
              <Logomark size={28} />
              <JoinCode code={code} size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ConnectionStatus />
            </div>
          </header>
        )}

        <SurfacePanel className="mt-4 flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Live room
            </p>
            <p className="mt-0.5 text-sm text-ink-secondary">
              {count === 1 ? "1 person" : `${count} people`} here right now
            </p>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-subtle text-brand">
            <Users className="h-5 w-5" aria-hidden />
          </span>
        </SurfacePanel>

        <div className="mt-4 grid w-full grid-cols-2 rounded-lg border border-border bg-surface-sunken p-1">
          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-fast ${activeTab === "activity"
                ? "bg-surface-card text-foreground shadow-xs"
                : "text-ink-muted hover:text-foreground"
              }`}
          >
            <Radio className="h-4 w-4" aria-hidden />
            Activity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("qa")}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-fast ${activeTab === "qa"
                ? "bg-surface-card text-foreground shadow-xs"
                : "text-ink-muted hover:text-foreground"
              }`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Q&amp;A
          </button>
        </div>

        {activeTab === "activity" && (
          <AnimatePresence mode="wait">
            {showWaitingState && (
              <AnimatedTransition transitionKey="waiting">
                <EmptyState
                  className="mt-6 flex-1 py-16"
                  tone="brand"
                  icon={
                    <div className="relative flex h-6 w-6 items-center justify-center">
                      <Radio className="absolute h-6 w-6" />
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                    </div>
                  }
                  title="Waiting for the host"
                  description="Hang tight. The next activity will appear here as soon as it starts."
                />
                <ReactionBar onReact={sendReaction} />
              </AnimatedTransition>
            )}

            {showPollInput && activeActivity && (
              <AnimatedTransition transitionKey={`poll-input-${activeActivity._id}`}>
                <SurfacePanel className="mt-6 p-5 sm:p-6">
                  <PollParticipant
                    key={activeActivity._id}
                    activity={activeActivity}
                    tallies={tallies}
                    pollEndsAt={pollEndsAt}
                    hasSubmitted={hasSubmitted}
                    onSubmit={submitResponse}
                  />
                </SurfacePanel>
              </AnimatedTransition>
            )}

            {showPollSubmitted && activeActivity && (
              <AnimatedTransition transitionKey={`poll-submitted-${activeActivity._id}`}>
                <SurfacePanel className="mt-6 space-y-4 p-5 sm:p-6">
                  <div>
                    <Eyebrow>Vote submitted</Eyebrow>
                    <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
                      {(activeActivity.config as { question?: string })?.question}
                    </h2>
                  </div>
                  <EmptyState
                    title="Waiting for results"
                    description="Your vote has been counted. Results will appear when the host shares them."
                  />
                </SurfacePanel>
              </AnimatedTransition>
            )}

            {showPollResults && activeActivity && (
              <AnimatedTransition transitionKey={`poll-results-${activeActivity._id}`}>
                <SurfacePanel className="mt-6 space-y-4 p-5 sm:p-6">
                  <div>
                    <Eyebrow>Poll closed</Eyebrow>
                    <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
                      {(activeActivity.config as { question?: string })?.question}
                    </h2>
                  </div>

                  {tallies ? (
                    <PollResultsChart tallies={tallies} />
                  ) : (
                    <EmptyState
                      title="No responses recorded"
                      description="There were no poll submissions for this activity."
                    />
                  )}
                </SurfacePanel>
              </AnimatedTransition>
            )}

            {showQuizWaiting && (
              <AnimatedTransition transitionKey="quiz-waiting">
                <EmptyState
                  className="mt-6"
                  tone="brand"
                  icon={
                    <div className="relative flex h-6 w-6 items-center justify-center">
                      <Radio className="absolute h-6 w-6" />
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                    </div>
                  }
                  title="Quiz is live"
                  description="Waiting for the host to send the next question."
                />
              </AnimatedTransition>
            )}

            {showQuizQuestion && quizQuestion && (
              <AnimatedTransition transitionKey={`quiz-question-${quizQuestion.questionId}`}>
                <SurfacePanel className="mt-6 p-5 sm:p-6">
                  <QuizParticipant
                    key={quizQuestion.questionId}
                    question={quizQuestion}
                    hasAnswered={hasAnsweredQuiz}
                    answerState={quizAnswerState}
                    onAnswer={submitQuizAnswer}
                  />
                </SurfacePanel>
              </AnimatedTransition>
            )}

            {showQuizClosed && (
              <AnimatedTransition transitionKey="quiz-closed">
                <SurfacePanel className="mt-6 p-5 sm:p-6">
                  <EmptyState
                    className="mb-4 py-8"
                    title="Quiz ended"
                    description="Final scores are below."
                  />

                  <div className="space-y-3">
                    <Eyebrow>Leaderboard</Eyebrow>

                    {quizLeaderboard.length > 0 ? (
                      <div className="space-y-2">
                        {quizLeaderboard.map((entry, index) => (
                          <LeaderboardRow
                            key={`${entry.name}-${index}`}
                            rank={index + 1}
                            name={entry.name}
                            points={entry.points}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="Waiting for leaderboard"
                        description="Scores will appear as soon as they are available."
                      />
                    )}
                  </div>
                </SurfacePanel>
              </AnimatedTransition>
            )}

            {showWordCloudInput && activeActivity && (
              <AnimatedTransition transitionKey={`wordcloud-input-${activeActivity._id}`}>
                <SurfacePanel className="mt-6 p-5 sm:p-6">
                  <WordCloudParticipant
                    key={activeActivity._id}
                    activity={activeActivity}
                    wordCloudEndsAt={pollEndsAt}
                    hasSubmitted={hasSubmitted}
                    submittedWords={submittedWordCloudWords}
                    liveWords={wordCloudWords}
                    onSubmit={submitWordCloudWords}
                  />
                </SurfacePanel>
              </AnimatedTransition>
            )}

            {showWordCloudSubmitted && activeActivity && (
              <AnimatedTransition transitionKey={`wordcloud-submitted-${activeActivity._id}`}>
                <SurfacePanel className="mt-6 p-5 sm:p-6">
                  <WordCloudParticipant
                    key={activeActivity._id}
                    activity={activeActivity}
                    wordCloudEndsAt={pollEndsAt}
                    hasSubmitted={hasSubmitted}
                    submittedWords={submittedWordCloudWords}
                    liveWords={wordCloudWords}
                    onSubmit={submitWordCloudWords}
                  />
                </SurfacePanel>
              </AnimatedTransition>
            )}

            {showFeedbackInput && activeActivity && (
              <AnimatedTransition transitionKey={`feedback-input-${activeActivity._id}`}>
                <div className="mt-6">
                  <FeedbackParticipant
                    key={activeActivity._id}
                    activityId={activeActivity._id}
                    title={activeActivity.title}
                    config={activeActivity.config as FeedbackParticipantConfig}
                    feedbackEndsAt={pollEndsAt}
                    submitted={hasSubmitted}
                    onSubmit={handleFeedbackSubmit}
                  />
                </div>
              </AnimatedTransition>
            )}

            {showFeedbackSubmitted && activeActivity && (
              <AnimatedTransition transitionKey={`feedback-submitted-${activeActivity._id}`}>
                <div className="mt-6">
                  <FeedbackParticipant
                    key={activeActivity._id}
                    activityId={activeActivity._id}
                    title={activeActivity.title}
                    config={activeActivity.config as FeedbackParticipantConfig}
                    feedbackEndsAt={pollEndsAt}
                    submitted
                    onSubmit={handleFeedbackSubmit}
                  />

                  <SurfacePanel
                    tone="sunken"
                    className="mt-4 p-4 text-sm text-ink-secondary"
                  >
                    {activeActivity.status === "closed"
                      ? "This feedback form is now closed."
                      : "Thanks. Your feedback has been submitted."}
                  </SurfacePanel>
                </div>
              </AnimatedTransition>
            )}

            {showSurveyInput && activeActivity && (
              <AnimatedTransition transitionKey={`survey-input-${activeActivity._id}`}>
                <div className="mt-6 h-full flex-1">
                  <SurveyParticipant
                    key={activeActivity._id}
                    activity={activeActivity}
                    participantAnonId={anonId}
                    eventCode={code}
                  />
                </div>
              </AnimatedTransition>
            )}
          </AnimatePresence>
        )}

        {activeTab === "qa" && (
          <QaTab
            questions={sortedApprovedQuestions}
            votedQuestionIds={votedQuestionIds}
            allowAnonymousQA={allowAnonymousQA}
            onAskQuestion={handleAskQuestion}
            onUpvoteQuestion={handleUpvoteQuestion}
          />
        )}
      </div>
    </main>
  );
}
