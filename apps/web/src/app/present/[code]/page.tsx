'use client';

import { useParams } from 'next/navigation';

import { ConnectionStatus } from '@/components/connection-status';
import { ProjectorQaView } from '@/components/projector/projector-qa-view';
import { QuizProjectorView } from '@/components/projector/quiz-projector-view';
import { WordCloudProjectorView } from '@/components/projector/wordcloud-projector-view';
import { SurveyProjectorView } from '@/components/poll/survey-projector-view';
import { EmptyState, SurfacePanel } from '@/components/ui';
import { useEventRealtime } from '@/lib/use-event-realtime';
import { usePoll } from '@/hooks/use-poll';
import { PollResultsChart } from '@/components/poll/poll-results-chart';
import { JoinCode, LiveDot, Wordmark } from '@/components/pulse';

export default function PresenterPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { count, error, approvedQuestions, allQuestions } = useEventRealtime(
    code,
    'observe',
  );
  const {
    activeActivity,
    tallies,
    quizQuestion,
    quizLeaderboard,
    wordCloudWords,
  } = usePoll(null);

  if (error) {
    return (
      <main className="pulse-stage flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="font-display text-4xl font-bold text-foreground">
          Can&apos;t show this event
        </h1>
        <p className="text-ink-muted">{error}</p>
      </main>
    );
  }

  const hasQuizState = Boolean(
    (activeActivity && activeActivity.type === 'quiz') ||
      quizQuestion ||
      quizLeaderboard.length > 0,
  );

  const showWaitingState = !activeActivity && !hasQuizState;
  const showPoll = activeActivity && activeActivity.type === 'poll';
  const showQuiz = hasQuizState;
  const showWordCloud = activeActivity && activeActivity.type === 'wordcloud';
  const showFeedback = activeActivity && activeActivity.type === 'feedback';
  const showSurvey = activeActivity && activeActivity.type === 'survey';
  const answeredQuestions = allQuestions.filter(
    (question) => question.status === 'answered',
  );
  const projectorQuestions = [...approvedQuestions, ...answeredQuestions].sort(
    (a, b) => {
      if (b.voteCount !== a.voteCount) {
        return b.voteCount - a.voteCount;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    },
  );
  const showQa = projectorQuestions.length > 0;
  const isPollLive = showPoll && activeActivity.status === 'live';

  return (
    <main className="pulse-stage relative flex min-h-screen flex-col overflow-hidden p-6 sm:p-8 lg:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(109,170,176,0.22),transparent_62%)]"
      />

      <header className="relative z-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Wordmark dark width={140} />
          <div className="hidden h-10 w-px bg-border sm:block" />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Join at pulse.app
            </span>
            <JoinCode code={code} size="lg" inverse />
          </div>
        </div>
        <ConnectionStatus className="border border-border bg-surface-card/80 px-3 py-1 text-ink-secondary" />
      </header>

      <div className="relative z-10 flex flex-1 flex-col gap-8 pt-8 lg:gap-10 lg:pt-10">
        <section
          aria-label="Event status"
          className="mx-auto grid w-full max-w-7xl items-center gap-5 rounded-lg border border-border bg-surface-card/70 px-5 py-4 shadow-xs backdrop-blur sm:grid-cols-[1fr_auto_1fr]"
        >
          <div className="flex justify-center sm:justify-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-1.5">
              <LiveDot />
              <span className="text-sm font-semibold uppercase tracking-wider text-ink-secondary">
                Live now
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="font-display text-6xl font-bold leading-none text-foreground sm:text-7xl">
              {count}
            </p>
            <p className="mt-1 text-lg text-ink-muted">
              {count === 1 ? 'participant' : 'participants'} joined
            </p>
          </div>

          <div className="flex justify-center sm:hidden">
            <JoinCode code={code} size="md" inverse />
          </div>
        </section>

        {showWaitingState && !showQa && (
          <section className="flex flex-1 items-center justify-center py-10">
            <div className="mx-auto grid w-full max-w-5xl gap-8 text-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-1.5">
                  <LiveDot live={false} />
                  <span className="text-sm font-semibold uppercase tracking-wider text-ink-secondary">
                    Ready to present
                  </span>
                </div>
                <h1 className="font-display text-5xl font-bold leading-tight text-foreground sm:text-6xl">
                  Waiting for the host
                </h1>
                <p className="mx-auto max-w-2xl text-xl text-ink-muted">
                  Launch an activity from the host dashboard and it will appear here.
                </p>
              </div>

              <SurfacePanel className="mx-auto w-full max-w-2xl border-border bg-surface-card/80 p-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                  Audience join code
                </p>
                <div className="mt-2 flex justify-center">
                  <JoinCode code={code} size="xl" inverse />
                </div>
              </SurfacePanel>
            </div>
          </section>
        )}

        {showPoll && (
          <section className="mx-auto grid w-full max-w-6xl gap-6 text-left">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-1.5">
                {isPollLive && <LiveDot />}
                <span className="text-sm font-semibold uppercase tracking-wider text-ink-secondary">
                  {isPollLive ? 'Live poll' : 'Poll closed'}
                </span>
              </div>
              <h1 className="mx-auto max-w-5xl font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {(activeActivity.config as { question?: string })?.question}
              </h1>
            </div>

            {tallies ? (
              <SurfacePanel className="rounded-lg border-border bg-surface-card/85 p-5 shadow-xs backdrop-blur sm:p-8 lg:p-10">
                <PollResultsChart tallies={tallies} projector inverse />
              </SurfacePanel>
            ) : (
              <EmptyState
                title="Waiting for responses"
                description="Results will update here as participants answer."
                className="border-border bg-surface-card/80 py-16 text-lg"
              />
            )}
          </section>
        )}

        {showFeedback && activeActivity && (
          <FeedbackProjectorStage
            title={activeActivity.title}
            prompt={activeActivity.config.prompt ?? activeActivity.config.question}
            fields={activeActivity.config.fields ?? []}
            isLive={activeActivity.status === 'live'}
          />
        )}

        {showQuiz && (
          <section className="mx-auto w-full max-w-[92rem]">
            <QuizProjectorView
              question={quizQuestion}
              leaderboard={quizLeaderboard}
            />
          </section>
        )}

        {showWordCloud && activeActivity && (
          <section className="mx-auto w-full max-w-[92rem]">
            <WordCloudProjectorView
              title={activeActivity.title}
              prompt={activeActivity.config.prompt ?? activeActivity.config.question}
              words={wordCloudWords}
            />
          </section>
        )}

        {showSurvey && activeActivity && (
          <SurveyProjectorView activity={activeActivity as any} eventCode={code} />
        )}

        <section className="mx-auto w-full max-w-[92rem]">
          <ProjectorQaView questions={projectorQuestions} />
        </section>
      </div>
    </main>
  );
}

function FeedbackProjectorStage({
  title,
  prompt,
  fields,
  isLive,
}: {
  title?: string;
  prompt?: string;
  fields: Array<{ id: string; type: 'rating' | 'text'; label: string }>;
  isLive: boolean;
}) {
  const ratingFields = fields.filter((field) => field.type === 'rating').length;
  const textFields = fields.filter((field) => field.type === 'text').length;

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-1.5">
          <LiveDot live={isLive} />
          <span className="text-sm font-semibold uppercase tracking-wider text-ink-secondary">
            {isLive ? 'Live feedback' : 'Feedback closed'}
          </span>
        </div>

        <h1 className="mx-auto max-w-5xl font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
          {prompt || title || 'Share your feedback'}
        </h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <SurfacePanel className="border-border bg-surface-card/85 p-6 shadow-xs sm:p-8">
          {fields.length === 0 ? (
            <EmptyState
              title="No feedback fields configured"
              description="Participants will see the configured feedback form when it is launched."
              className="bg-surface-sunken/80 py-14"
            />
          ) : (
            <div className="grid gap-4">
              {fields.map((field, index) => (
                <article
                  key={field.id}
                  className="rounded-lg border border-border bg-surface-sunken px-5 py-5 sm:px-6"
                >
                  <div className="flex items-start gap-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-raised font-mono text-lg font-bold tabular-nums text-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-2xl font-semibold leading-snug text-foreground">
                        {field.label || 'Untitled field'}
                      </p>
                      <p className="mt-2 text-base font-medium uppercase tracking-wider text-ink-muted">
                        {field.type === 'rating' ? 'Rating response' : 'Written response'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SurfacePanel>

        <aside className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <SurfacePanel className="border-border bg-surface-card/85 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Fields
            </p>
            <p className="mt-2 font-display text-5xl font-bold tabular-nums text-foreground">
              {fields.length}
            </p>
          </SurfacePanel>
          <SurfacePanel className="border-border bg-surface-card/85 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Rating
            </p>
            <p className="mt-2 font-display text-5xl font-bold tabular-nums text-brand">
              {ratingFields}
            </p>
          </SurfacePanel>
          <SurfacePanel className="border-border bg-surface-card/85 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Text
            </p>
            <p className="mt-2 font-display text-5xl font-bold tabular-nums text-foreground">
              {textFields}
            </p>
          </SurfacePanel>
        </aside>
      </div>
    </section>
  );
}
