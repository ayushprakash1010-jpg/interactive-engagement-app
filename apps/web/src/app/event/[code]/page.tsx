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
import { getAnonId } from '@/lib/anon-id';
import { Eyebrow, JoinCode, LeaderboardRow, Logomark } from '@/components/pulse';

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
    allowAnonymousQA,
    askQuestion,
    upvoteQuestion,
  } = useEventRealtime(code, 'participant');

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
      <main className="flex min-h-screen flex-col bg-surface-canvas px-4 py-6">
        <div className="mx-auto flex w-full max-w-container-sm flex-1 flex-col">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Logomark size={28} />
              <JoinCode code={code} size="sm" />
            </div>
            <ConnectionStatus />
          </header>

          <div className="mt-6 rounded-md border border-dashed border-border bg-surface-card p-8 text-center text-sm text-ink-muted">
            Loading session…
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-canvas px-4 py-10 text-center">
        <div className="mx-auto w-full max-w-container-sm">
          <Logomark size={40} className="mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Can&apos;t join this session
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-ink-secondary">{error}</p>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/join">Try another code</Link>
          </Button>
        </div>
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
    <main className="flex min-h-screen flex-col bg-surface-canvas px-4 py-6">
      <div className="mx-auto flex w-full max-w-container-sm flex-1 flex-col">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logomark size={28} />
            <JoinCode code={code} size="sm" />
          </div>
          <ConnectionStatus />
        </header>

        <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-surface-card px-4 py-2.5 text-sm text-ink-secondary">
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {count}
          </span>
          {count === 1 ? 'person' : 'people'} here right now
        </div>

        <div className="mt-4 grid w-full grid-cols-2 rounded-md border border-border bg-surface-sunken p-1">
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`rounded-sm px-4 py-2 text-sm font-semibold transition-colors duration-fast ${
              activeTab === 'activity'
                ? 'bg-surface-card text-foreground shadow-xs'
                : 'text-ink-muted hover:text-foreground'
            }`}
          >
            Activity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qa')}
            className={`rounded-sm px-4 py-2 text-sm font-semibold transition-colors duration-fast ${
              activeTab === 'qa'
                ? 'bg-surface-card text-foreground shadow-xs'
                : 'text-ink-muted hover:text-foreground'
            }`}
          >
            Q&amp;A
          </button>
        </div>

        {activeTab === 'activity' && (
          <>
          {showWaitingState && (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-surface-card px-6 py-16 text-center">
              <span className="pulse-dot h-2.5 w-2.5 rounded-full bg-brand" aria-hidden />
              <p className="text-base text-ink-secondary">
                Hang tight — the host will start an activity soon.
              </p>
            </div>
          )}

          {showPollInput && activeActivity && (
            <div className="mt-6 rounded-md border border-border bg-surface-card p-5 shadow-xs">
              <PollParticipant
                key={activeActivity._id}
                activity={activeActivity}
                tallies={tallies}
                pollEndsAt={pollEndsAt} 
                hasSubmitted={hasSubmitted}
                onSubmit={submitResponse}
              />
            </div>
          )}

          {showPollResults && activeActivity && (
            <div className="mt-6 space-y-4 rounded-md border border-border bg-surface-card p-5 shadow-xs">
              <div>
                <Eyebrow>
                  {activeActivity.status === 'closed'
                    ? 'Poll closed'
                    : 'Vote submitted'}
                </Eyebrow>
                <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
                  {(activeActivity.config as { question?: string })?.question}
                </h2>
              </div>

              {tallies ? (
                <PollResultsChart tallies={tallies} />
              ) : (
                <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-ink-muted">
                  Waiting for results…
                </div>
              )}
            </div>
          )}

          {showQuizWaiting && (
            <div className="mt-6 rounded-md border border-dashed border-border bg-surface-card p-8 text-center text-sm text-ink-muted">
              Waiting for the next quiz question…
            </div>
          )}

          {showQuizQuestion && quizQuestion && (
            <div className="mt-6 rounded-md border border-border bg-surface-card p-5 shadow-xs">
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
            <div className="mt-6 rounded-md border border-border bg-surface-card p-5 shadow-xs">
              <div className="mb-4 rounded-md border border-dashed border-border p-4 text-sm text-ink-muted">
                The quiz has ended.
              </div>

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
                  <div className="rounded-md border border-dashed border-border p-4 text-sm text-ink-muted">
                    Waiting for leaderboard…
                  </div>
                )}
              </div>
            </div>
          )}

          {showWordCloudInput && activeActivity && (
            <div className="mt-6 rounded-md border border-border bg-surface-card p-5 shadow-xs">
              <WordCloudParticipant
                key={activeActivity._id}
                activity={activeActivity}
                wordCloudEndsAt={pollEndsAt} // <--- THE TIMER PROP IS PASSED HERE!
                hasSubmitted={hasSubmitted}
                submittedWords={submittedWordCloudWords}
                liveWords={wordCloudWords}
                onSubmit={submitWordCloudWords}
              />
            </div>
          )}

          {showWordCloudSubmitted && activeActivity && (
            <div className="mt-6 rounded-md border border-border bg-surface-card p-5 shadow-xs">
              <WordCloudParticipant
                key={activeActivity._id}
                activity={activeActivity}
                wordCloudEndsAt={pollEndsAt} // <--- AND HERE!
                hasSubmitted={hasSubmitted}
                submittedWords={submittedWordCloudWords}
                liveWords={wordCloudWords}
                onSubmit={submitWordCloudWords}
              />
            </div>
          )}

          {showFeedbackInput && activeActivity && (
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
          )}

          {showFeedbackSubmitted && activeActivity && (
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

              <div className="mt-4 rounded-md border border-dashed border-border p-4 text-sm text-ink-muted">
                {activeActivity.status === 'closed'
                  ? 'This feedback form is now closed.'
                  : 'Thanks — your feedback has been submitted.'}
              </div>
            </div>
          )}
          </>
        )}

        {activeTab === 'qa' && (
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
