'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ConnectionStatus } from '@/components/connection-status';
import { useEventRealtime } from '@/lib/use-event-realtime';
import { usePoll } from '@/hooks/use-poll';
import { PollParticipant } from '@/components/poll/poll-participant';
import { PollResultsChart } from '@/components/poll/poll-results-chart';
import { QaTab } from '@/components/participant/qa-tab';

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

type ParticipantTab = 'poll' | 'qa';

export default function EventPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const anonId = getAnonId();
  const [activeTab, setActiveTab] = useState<ParticipantTab>('poll');
  const [votedQuestionIds, setLocalVotedQuestionIds] = useState<string[]>(() =>
    getVotedQuestionIds(code),
  );

  const {
    count,
    error,
    approvedQuestions,
    askQuestion,
    upvoteQuestion,
  } = useEventRealtime(code, 'participant');

  const { activeActivity, tallies, hasSubmitted, submitResponse } = usePoll(anonId);

  const sortedApprovedQuestions = useMemo(() => {
    return [...approvedQuestions].sort((a, b) => {
      if (b.voteCount !== a.voteCount) {
        return b.voteCount - a.voteCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [approvedQuestions]);

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

  const showWaitingState = !activeActivity;
  const showPollInput =
    activeActivity &&
    activeActivity.type === 'poll' &&
    activeActivity.status === 'live' &&
    !hasSubmitted;

  const showPollResults =
    activeActivity &&
    activeActivity.type === 'poll' &&
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
          onClick={() => setActiveTab('poll')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === 'poll'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          Poll
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

      {activeTab === 'poll' && (
        <>
          {showWaitingState && (
            <div className="mt-6 flex flex-1 items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
              <p>Waiting for the host to start an activity…</p>
            </div>
          )}

          {showPollInput && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <PollParticipant
                activity={activeActivity}
                tallies={tallies}
                hasSubmitted={hasSubmitted}
                onSubmit={submitResponse}
              />
            </div>
          )}

          {showPollResults && (
            <div className="mt-6 space-y-4 rounded-lg border bg-card p-6">
              <div>
                <p className="text-sm font-medium text-primary">
                  {activeActivity.status === 'closed'
                    ? 'Poll closed'
                    : 'Response submitted'}
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {(activeActivity.config as any)?.question}
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