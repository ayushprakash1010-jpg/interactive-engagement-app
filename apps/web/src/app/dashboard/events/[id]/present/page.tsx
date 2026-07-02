'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Monitor,
  Users,
  ArrowLeft,
  Wifi,
  WifiOff,
  BarChart3,
  Sparkles,
  Trophy,
  Cloud,
} from 'lucide-react';
import { usePoll } from '@/hooks/use-poll';
import { useEvent, useEventQr } from '@/lib/use-events';
import { useEventRealtime } from '@/lib/use-event-realtime';
import { PollResultsChart } from '@/components/poll/poll-results-chart';
import { JoinCode, LiveDot } from '@/components/pulse';
import { socket } from '@/lib/socket';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────── */
/* Helpers                                                  */
/* ─────────────────────────────────────────────────────── */

function useSocketStatus() {
  const [connected, setConnected] = React.useState(socket.connected);

  React.useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return connected;
}

/* ─────────────────────────────────────────────────────── */
/* Idle / Join Screen                                       */
/* ─────────────────────────────────────────────────────── */

function IdleScreen({
  eventName,
  eventCode,
  qrDataUrl,
  joinUrl,
}: {
  eventName: string;
  eventCode?: string;
  qrDataUrl?: string;
  joinUrl?: string;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-12 px-8 py-16 text-center">
      {/* Ambient glow blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px]" />
      </div>

      {/* Logo / Brand */}
      <div className="relative flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
          <Sparkles className="h-6 w-6" />
        </span>
        <span className="text-3xl font-bold tracking-tight text-foreground">
          Pulse
        </span>
      </div>

      {/* Event title */}
      <div className="relative space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-ink-muted">
          You&apos;re watching
        </p>
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-7xl">
          {eventName}
        </h1>
      </div>

      {/* Join block */}
      <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        {/* QR Code */}
        {qrDataUrl && (
          <div className="flex flex-col items-center gap-3">
            <div className="overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-xl">
              <Image
                src={qrDataUrl}
                alt="QR code to join"
                width={180}
                height={180}
                unoptimized
              />
            </div>
            <p className="text-sm text-ink-muted">Scan to join</p>
          </div>
        )}

        {/* Divider */}
        {qrDataUrl && eventCode && (
          <div className="flex flex-col items-center justify-center gap-2 self-center sm:h-40">
            <div className="h-full w-px bg-border sm:h-32" />
            <span className="text-xs text-ink-muted">or</span>
            <div className="h-full w-px bg-border sm:h-32" />
          </div>
        )}

        {/* Code + URL */}
        {eventCode && (
          <div className="flex flex-col items-center gap-4 self-center">
            <div className="space-y-1 text-center">
              <p className="text-sm text-ink-muted">Go to</p>
              <p className="text-xl font-semibold text-foreground">
                {joinUrl
                  ? new URL(joinUrl).host
                  : 'pulse.app/join'}
              </p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm text-ink-muted">Enter code</p>
              <JoinCode code={eventCode} size="lg" />
            </div>
          </div>
        )}
      </div>

      {/* Waiting hint */}
      <p className="relative animate-pulse text-sm text-ink-muted">
        Waiting for the host to start an activity…
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Live Poll Screen                                         */
/* ─────────────────────────────────────────────────────── */

function LivePollScreen({
  question,
  tallies,
  totalResponses,
  timeLabel,
}: {
  question: string;
  tallies: ReturnType<typeof usePoll>['tallies'];
  totalResponses: number;
  timeLabel: string | null;
}) {
  return (
    <div className="flex min-h-full flex-col justify-center gap-10 px-12 py-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <LiveDot />
          <span className="text-sm font-bold uppercase tracking-widest text-brand">
            Live Poll
          </span>
          {timeLabel && (
            <span className="ml-auto rounded-xl border border-brand/40 bg-brand/10 px-4 py-1 font-mono text-2xl font-bold tabular-nums text-brand">
              {timeLabel}
            </span>
          )}
        </div>
        <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
          {question}
        </h2>
        <p className="text-lg text-ink-muted">
          {totalResponses} response{totalResponses !== 1 ? 's' : ''} so far
        </p>
      </div>

      {/* Chart */}
      <div className="relative rounded-2xl border border-border bg-surface-card p-6 shadow-lg">
        {tallies ? (
          <PollResultsChart tallies={tallies} projector />
        ) : (
          <div className="flex flex-col items-center gap-4 py-16">
            <BarChart3 className="h-14 w-14 animate-pulse text-ink-muted/40" />
            <p className="text-xl text-ink-muted">
              Waiting for first vote…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Live Quiz Screen                                         */
/* ─────────────────────────────────────────────────────── */

function LiveQuizScreen({
  question,
  quizLeaderboard,
}: {
  question: ReturnType<typeof usePoll>['quizQuestion'];
  quizLeaderboard: ReturnType<typeof usePoll>['quizLeaderboard'];
}) {
  const [timeLeftMs, setTimeLeftMs] = React.useState(0);

  React.useEffect(() => {
    if (!question) { setTimeLeftMs(0); return; }
    const update = () => setTimeLeftMs(Math.max(0, question.endsAt - Date.now()));
    update();
    const iv = window.setInterval(update, 1000);
    return () => window.clearInterval(iv);
  }, [question]);

  const timeLabel = React.useMemo(() => {
    if (!question) return null;
    const s = Math.ceil(timeLeftMs / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }, [timeLeftMs, question]);

  return (
    <div className="flex min-h-full flex-col gap-8 px-12 py-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <LiveDot />
        <span className="text-sm font-bold uppercase tracking-widest text-brand">
          Quiz
        </span>
        {question?.questionNumber !== undefined && (
          <span className="ml-2 text-sm text-ink-muted">
            Question {question.questionNumber + 1}
          </span>
        )}
        {timeLabel && (
          <span className="ml-auto rounded-xl border border-brand/40 bg-brand/10 px-4 py-1 font-mono text-2xl font-bold tabular-nums text-brand">
            {timeLabel}
          </span>
        )}
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        {/* Question + Options */}
        {question ? (
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
              {question.text}
            </h2>
            <div className="grid gap-3">
              {question.options.map((opt, i) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-4 text-xl font-semibold text-foreground shadow-xs"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <Trophy className="h-16 w-16 animate-bounce text-yellow-400" />
            <p className="text-2xl font-bold text-foreground">Quiz complete!</p>
          </div>
        )}

        {/* Live Leaderboard */}
        {quizLeaderboard.length > 0 && (
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-card p-6 shadow-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-foreground">Leaderboard</span>
            </div>
            <ol className="space-y-2">
              {quizLeaderboard.slice(0, 5).map((entry, i) => (
                <li
                  key={i}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                    i === 0
                      ? 'bg-yellow-500/15 text-yellow-300'
                      : i === 1
                        ? 'bg-slate-400/10 text-slate-300'
                        : i === 2
                          ? 'bg-amber-700/10 text-amber-400'
                          : 'bg-surface-raised text-foreground',
                  )}
                >
                  <span className="w-5 text-center">{i + 1}</span>
                  <span className="flex-1">{entry.name}</span>
                  <span className="font-mono">{entry.points} pts</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Live Word Cloud Screen                                   */
/* ─────────────────────────────────────────────────────── */

function LiveWordCloudScreen({
  prompt,
  words,
}: {
  prompt: string;
  words: ReturnType<typeof usePoll>['wordCloudWords'];
}) {
  const max = Math.max(1, ...words.map((w) => w.weight));

  return (
    <div className="flex min-h-full flex-col gap-8 px-12 py-12">
      <div className="flex items-center gap-3">
        <LiveDot />
        <Cloud className="h-5 w-5 text-brand" />
        <span className="text-sm font-bold uppercase tracking-widest text-brand">
          Word Cloud
        </span>
      </div>
      <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
        {prompt}
      </h2>

      <div className="relative flex min-h-[320px] flex-1 flex-wrap items-center justify-center gap-4 rounded-2xl border border-border bg-surface-card p-8 shadow-lg">
        {words.length === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <Cloud className="h-14 w-14 animate-pulse text-ink-muted/40" />
            <p className="text-xl text-ink-muted">Waiting for words…</p>
          </div>
        ) : (
          words.map((w, i) => {
            const ratio = w.weight / max;
            const size = Math.round(20 + ratio * 60);
            const opacity = 0.5 + ratio * 0.5;
            const colors = [
              'text-brand',
              'text-sky-400',
              'text-violet-400',
              'text-emerald-400',
              'text-amber-400',
              'text-rose-400',
            ];
            return (
              <span
                key={i}
                className={cn(
                  'font-extrabold leading-none transition-all duration-700',
                  colors[i % colors.length],
                )}
                style={{ fontSize: size, opacity }}
              >
                {w.text}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Page                                                     */
/* ─────────────────────────────────────────────────────── */

export default function PresentPage() {
  const { id } = useParams<{ id: string }>();

  const { data: event } = useEvent(id);
  const { data: qr } = useEventQr(id);

  // 🔑 KEY FIX: Join the socket room as an observer so all
  // ACTIVITY_LAUNCHED / POLL_RESULTS / etc. events are received.
  useEventRealtime(event?.eventCode, 'observe', { eventId: id });

  const isConnected = useSocketStatus();

  const {
    activeActivity,
    tallies,
    pollEndsAt,
    quizQuestion,
    quizLeaderboard,
    wordCloudWords,
  } = usePoll(null);

  /* ── Timer for poll ── */
  const [timeLeftMs, setTimeLeftMs] = React.useState(0);

  React.useEffect(() => {
    const isLive = activeActivity?.status === 'live';
    if (!isLive || !pollEndsAt) { setTimeLeftMs(0); return; }
    const update = () => setTimeLeftMs(Math.max(0, pollEndsAt - Date.now()));
    update();
    const iv = window.setInterval(update, 1000);
    return () => window.clearInterval(iv);
  }, [activeActivity?.status, pollEndsAt]);

  const pollTimeLabel = React.useMemo(() => {
    if (!pollEndsAt) return null;
    const s = Math.ceil(timeLeftMs / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }, [timeLeftMs, pollEndsAt]);

  const isLive = activeActivity?.status === 'live';
  const totalResponses = tallies?.totalResponses ?? 0;

  /* Determine which screen to show */
  let content: React.ReactNode = null;

  if (!isLive || !activeActivity) {
    content = (
      <IdleScreen
        eventName={event?.name ?? 'Loading…'}
        eventCode={event?.eventCode}
        qrDataUrl={qr?.qrDataUrl}
        joinUrl={qr?.joinUrl}
      />
    );
  } else if (activeActivity.type === 'quiz') {
    content = (
      <LiveQuizScreen
        question={quizQuestion}
        quizLeaderboard={quizLeaderboard}
      />
    );
  } else if (activeActivity.type === 'wordcloud') {
    content = (
      <LiveWordCloudScreen
        prompt={activeActivity.config.prompt ?? activeActivity.title}
        words={wordCloudWords}
      />
    );
  } else {
    /* poll / feedback / survey — default to poll chart */
    content = (
      <LivePollScreen
        question={
          activeActivity.config.question ??
          activeActivity.config.prompt ??
          activeActivity.title
        }
        tallies={tallies}
        totalResponses={totalResponses}
        timeLabel={pollTimeLabel}
      />
    );
  }

  return (
    <div className="pulse-stage relative flex min-h-screen flex-col overflow-hidden bg-surface-page">
      {/* ── Top bar ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-surface-raised/80 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/events/${id}`}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-muted transition hover:bg-surface-card hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Participant count placeholder */}
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Users className="h-3.5 w-3.5" />
            Live view
          </span>

          {/* Connection status */}
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
              isConnected
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive',
            )}
          >
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isConnected ? 'Connected' : 'Reconnecting…'}
          </span>

          {/* Activity badge */}
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
              <Monitor className="h-3 w-3" />
              {activeActivity?.type ?? 'Activity'} live
            </span>
          )}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative flex-1">{content}</main>
    </div>
  );
}
