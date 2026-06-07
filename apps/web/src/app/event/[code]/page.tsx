'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ConnectionStatus } from '@/components/connection-status';
import { useEventRealtime } from '@/lib/use-event-realtime';
import { usePoll } from '@/hooks/use-poll';
import { PollParticipant } from '@/components/poll/poll-participant';
import { QuizParticipant } from '@/components/poll/quiz-participant';
import { WordCloudParticipant } from '@/components/poll/wordcloud-participant';
import { PollResultsChart } from '@/components/poll/poll-results-chart';
import { QaTab } from '@/components/participant/qa-tab';
import { FeedbackParticipant } from '@/components/poll/feedback-participant';

function getAnonId(): string {
  if (typeof window === 'undefined') return '';

  let anonId = localStorage.getItem('iep_anon_id');
  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem('iep_anon_id', anonId);
  }
  return anonId;
}

function getVotedQuestionIds(code: string): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(`iep_voted_questions:${code}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setVotedQuestionIds(code: string, questionIds: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`iep_voted_questions:${code}`, JSON.stringify(questionIds));
}

type ParticipantTab = 'activity' | 'qa';

type FeedbackParticipantConfig = {
  prompt: string;
  fields: Array<{
    id: string;
    type: 'rating' | 'text';
    label: string;
  }>;
};

export default function EventPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const [isMounted, setIsMounted] = useState(false);
  const [anonId, setAnonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ParticipantTab>('activity');
  const [votedQuestionIds, setLocalVotedQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setAnonId(getAnonId());
    setLocalVotedQuestionIds(getVotedQuestionIds(code));
  }, [code]);

  const {
    count,
    error,
    approvedQuestions,
    askQuestion,
    upvoteQuestion,
  } = useEventRealtime(code, 'participant');

  const {
    activeActivity,
    tallies,
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
      <main className="flex min-h-screen flex-col p-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Event {code}</h1>
          <ConnectionStatus />
        </header>

        <div className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Loading event…
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Can&apos;t join this event</h1>
        <p className="max-w-sm text-muted-foreground">{error}</p>
        <Button asChild>
          <Link href="/join">Try another code</Link>
        </Button>
      </main>
    );
  }

  const hasQuizLeaderboard = quizLeaderboard.length > 0;
  const hasQuizState = Boolean(
    (activeActivity && activeActivity.type === 'quiz') ||
      quizQuestion ||
      hasQuizLeaderboard,
  );

  const showWaitingState = !activeActivity && !hasQuizState;

  const showPollInput =
    activeActivity &&
    activeActivity.type === 'poll' &&
    activeActivity.status === 'live' &&
    !hasSubmitted;

  const showPollResults =
    activeActivity &&
    activeActivity.type === 'poll' &&
    (hasSubmitted || activeActivity.status === 'closed');

  const showQuizWaiting =
    activeActivity &&
    activeActivity.type === 'quiz' &&
    activeActivity.status === 'live' &&
    !quizQuestion;

  const showQuizQuestion =
    activeActivity &&
    activeActivity.type === 'quiz' &&
    activeActivity.status === 'live' &&
    quizQuestion;

  const showQuizClosed = !showQuizQuestion && hasQuizLeaderboard;

  const showWordCloudInput =
    activeActivity &&
    activeActivity.type === 'wordcloud' &&
    activeActivity.status === 'live' &&
    !hasSubmitted;

  const showWordCloudSubmitted =
    activeActivity &&
    activeActivity.type === 'wordcloud' &&
    (hasSubmitted || activeActivity.status === 'closed');

  const showFeedbackInput =
    activeActivity &&
    activeActivity.type === 'feedback' &&
    activeActivity.status === 'live' &&
    !hasSubmitted;

  const showFeedbackSubmitted =
    activeActivity &&
    activeActivity.type === 'feedback' &&
    (hasSubmitted || activeActivity.status === 'closed');

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
        type: answer.ratingValue !== undefined ? 'rating' : 'text',
        ratingValue: answer.ratingValue,
        textValue: answer.textValue,
      })),
    });
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Event {code}</h1>
        <ConnectionStatus />
      </header>

      <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        {count} {count === 1 ? 'person' : 'people'} connected
      </div>

      <div className="mt-6 inline-flex w-fit rounded-lg border bg-muted p-1">
        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === 'activity'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          Activity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('qa')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === 'qa'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          Q&amp;A
        </button>
      </div>

      {activeTab === 'activity' && (
        <>
          {showWaitingState && (
            <div className="mt-6 flex flex-1 items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
              <p>Waiting for the host to start an activity…</p>
            </div>
          )}

          {showPollInput && activeActivity && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <PollParticipant
                key={activeActivity._id}
                activity={activeActivity}
                tallies={tallies}
                hasSubmitted={hasSubmitted}
                onSubmit={submitResponse}
              />
            </div>
          )}

          {showPollResults && activeActivity && (
            <div className="mt-6 space-y-4 rounded-lg border bg-card p-6">
              <div>
                <p className="text-sm font-medium text-primary">
                  {activeActivity.status === 'closed'
                    ? 'Poll closed'
                    : 'Response submitted'}
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {(activeActivity.config as { question?: string })?.question}
                </h2>
              </div>

              {tallies ? (
                <PollResultsChart tallies={tallies} />
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Waiting for results…
                </div>
              )}
            </div>
          )}

          {showQuizWaiting && (
            <div className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Waiting for the next quiz question…
            </div>
          )}

          {showQuizQuestion && quizQuestion && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <QuizParticipant
                key={quizQuestion.questionId}
                question={quizQuestion}
                hasAnswered={hasAnsweredQuiz}
                answerState={quizAnswerState}
                quizLeaderboard={quizLeaderboard}
                onAnswer={submitQuizAnswer}
              />
            </div>
          )}

          {showQuizClosed && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <div className="mb-4 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                The quiz has ended.
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-primary">Leaderboard</p>

                {quizLeaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {quizLeaderboard.map((entry, index) => (
                      <div
                        key={`${entry.name}-${index}`}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <span>
                          {index + 1}. {entry.name}
                        </span>
                        <span className="font-semibold">{entry.points} pts</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Waiting for leaderboard…
                  </div>
                )}
              </div>
            </div>
          )}

          {showWordCloudInput && activeActivity && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <WordCloudParticipant
                key={activeActivity._id}
                activity={activeActivity}
                hasSubmitted={hasSubmitted}
                submittedWords={submittedWordCloudWords}
                liveWords={wordCloudWords}
                onSubmit={submitWordCloudWords}
              />
            </div>
          )}

          {showWordCloudSubmitted && activeActivity && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <WordCloudParticipant
                key={activeActivity._id}
                activity={activeActivity}
                hasSubmitted={hasSubmitted}
                submittedWords={submittedWordCloudWords}
                liveWords={wordCloudWords}
                onSubmit={submitWordCloudWords}
              />
            </div>
          )}

          {showFeedbackInput && activeActivity && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <FeedbackParticipant
                key={activeActivity._id}
                activityId={activeActivity._id}
                title={activeActivity.title}
                config={activeActivity.config as FeedbackParticipantConfig}
                submitted={hasSubmitted}
                onSubmit={handleFeedbackSubmit}
              />
            </div>
          )}

          {showFeedbackSubmitted && activeActivity && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <FeedbackParticipant
                key={activeActivity._id}
                activityId={activeActivity._id}
                title={activeActivity.title}
                config={activeActivity.config as FeedbackParticipantConfig}
                submitted
                onSubmit={handleFeedbackSubmit}
              />

              <div className="mt-4 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {activeActivity.status === 'closed'
                  ? 'This feedback form is now closed.'
                  : 'Your feedback has been submitted.'}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'qa' && (
        <QaTab
          questions={sortedApprovedQuestions}
          votedQuestionIds={votedQuestionIds}
          onAskQuestion={handleAskQuestion}
          onUpvoteQuestion={handleUpvoteQuestion}
        />
      )}
    </main>
  );
}