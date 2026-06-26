'use client';

import * as React from 'react';
import {
  Trophy,
  Users,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Target,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Eyebrow, Stat } from '@/components/pulse';
import { useAnalytics } from '@/hooks/use-analytics';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizScorecardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  activityId: string;
  quizTitle: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHART_COLORS = [
  '#01696f',
  '#437a22',
  '#006494',
  '#d19900',
  '#da7101',
  '#7a39bb',
];

const MEDAL: Record<number, string> = {
  1: 'bg-[#d19900] text-white',
  2: 'bg-[#9a9488] text-white',
  3: 'bg-[#b87333] text-white',
};

function getRankStyle(rank: number) {
  return MEDAL[rank] ?? 'bg-muted text-ink-muted';
}

function formatName(displayName: string | null, anonId: string): string {
  if (displayName && displayName.trim().length > 0) return displayName.trim();
  return `Participant ${String(anonId).slice(0, 6)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScorecardSkeleton() {
  return (
    <div className="space-y-6 pt-2">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border bg-muted/40" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-lg border bg-muted/40" />
      <div className="h-48 animate-pulse rounded-lg border bg-muted/40" />
    </div>
  );
}

function ScorecardError({ message }: { message: string }) {
  return (
    <Card className="border-destructive/40 mt-4">
      <CardHeader>
        <CardTitle className="text-base text-destructive">
          Could not load scorecard
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function ScorecardEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand">
        <Trophy className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="font-display text-lg font-semibold text-foreground">
          No responses yet
        </p>
        <p className="text-sm text-ink-secondary">
          Results will appear here once participants have submitted answers.
        </p>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function QuizScorecardModal({
  open,
  onOpenChange,
  eventId,
  activityId,
  quizTitle,
}: QuizScorecardModalProps) {
  const { data: report, isLoading, isError, error } = useAnalytics(eventId);

  const quiz = React.useMemo(() => {
    if (!report) return null;
    return report.quizAnalytics.find((q) => q.activityId === activityId) ?? null;
  }, [report, activityId]);

  const summaryStats = (quiz as any)?.summaryStats as {
    totalParticipants: number;
    totalResponses: number;
    averageScore: number;
    highestScore: number;
    completionRate: number;
  } | undefined;

  const participantScores = (quiz as any)?.participantScores as Array<{
    participantAnonId: string;
    displayName: string | null;
    totalPoints: number;
    correct: number;
    incorrect: number;
    percentage: number;
  }> | undefined;

  const questionStats = quiz?.questionStats as Array<{
    questionId: string;
    text: string;
    total: number;
    correct: number;
    incorrect: number;
    correctPct: number;
  }> | undefined;

  const hasResponses =
    (participantScores?.length ?? 0) > 0 ||
    (questionStats?.some((q) => q.total > 0) ?? false);

  // Score distribution buckets for chart
  const scoreDistribution = React.useMemo(() => {
    if (!participantScores || participantScores.length === 0) return [];

    const maxScore = summaryStats?.highestScore ?? 0;
    if (maxScore === 0) return [];

    const bucketSize = Math.ceil(maxScore / 5) || 1;
    const buckets: Record<string, number> = {};

    for (const p of participantScores) {
      const bucket =
        Math.floor(p.totalPoints / bucketSize) * bucketSize;
      const label = `${bucket}–${bucket + bucketSize - 1}`;
      buckets[label] = (buckets[label] ?? 0) + 1;
    }

    return Object.entries(buckets)
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => {
        const aStart = parseInt(a.range.split('–')[0] ?? '0', 10);
        const bStart = parseInt(b.range.split('–')[0] ?? '0', 10);
        return aStart - bStart;
      });
  }, [participantScores, summaryStats]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Eyebrow>Quiz Scorecard</Eyebrow>
          <DialogTitle className="font-display text-xl">
            {quizTitle}
          </DialogTitle>
          <DialogDescription>
            Final results and participant performance breakdown.
          </DialogDescription>
        </DialogHeader>

        {isLoading && <ScorecardSkeleton />}

        {isError && (
          <ScorecardError
            message={
              error instanceof Error
                ? error.message
                : 'Analytics not yet available.'
            }
          />
        )}

        {!isLoading && !isError && quiz && !hasResponses && <ScorecardEmpty />}

        {!isLoading && !isError && quiz && hasResponses && (
          <div className="space-y-6 pt-2">
            {/* ── Summary Cards ── */}
            {summaryStats && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardContent className="pt-5">
                    <Stat
                      label="Total Participants"
                      value={summaryStats.totalParticipants}
                      icon={<Users className="h-4 w-4" />}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <Stat
                      label="Total Responses"
                      value={summaryStats.totalResponses}
                      icon={<MessageSquare className="h-4 w-4" />}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <Stat
                      label="Average Score"
                      value={`${summaryStats.averageScore}`}
                      sub="points"
                      icon={<TrendingUp className="h-4 w-4" />}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <Stat
                      label="Highest Score"
                      value={summaryStats.highestScore}
                      sub="points"
                      icon={<Trophy className="h-4 w-4" />}
                      tone="brand"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <Stat
                      label="Completion Rate"
                      value={`${summaryStats.completionRate}%`}
                      sub="answered all questions"
                      icon={<Target className="h-4 w-4" />}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Leaderboard ── */}
            {participantScores && participantScores.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="h-4 w-4 text-brand" />
                    Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Participants ranked by total score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-2 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                            Rank
                          </th>
                          <th className="pb-2 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                            Participant
                          </th>
                          <th className="pb-2 pr-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                            Score
                          </th>
                          <th className="pb-2 pr-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                            Correct
                          </th>
                          <th className="pb-2 pr-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                            Incorrect
                          </th>
                          <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                            %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {participantScores.map((entry, i) => {
                          const rank = i + 1;
                          return (
                            <tr
                              key={entry.participantAnonId}
                              className="transition-colors hover:bg-muted/30"
                            >
                              <td className="py-2.5 pr-3">
                                <span
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${getRankStyle(rank)}`}
                                >
                                  {rank}
                                </span>
                              </td>
                              <td className="py-2.5 pr-3 font-medium text-foreground">
                                {formatName(
                                  entry.displayName,
                                  entry.participantAnonId,
                                )}
                              </td>
                              <td className="py-2.5 pr-3 text-right font-mono font-bold tabular-nums text-foreground">
                                {entry.totalPoints}
                                <span className="ml-0.5 text-xs font-normal text-ink-faint">
                                  pts
                                </span>
                              </td>
                              <td className="py-2.5 pr-3 text-right tabular-nums">
                                <span className="inline-flex items-center gap-1 text-success">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {entry.correct}
                                </span>
                              </td>
                              <td className="py-2.5 pr-3 text-right tabular-nums">
                                <span className="inline-flex items-center gap-1 text-destructive">
                                  <XCircle className="h-3.5 w-3.5" />
                                  {entry.incorrect}
                                </span>
                              </td>
                              <td className="py-2.5 text-right">
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                                    entry.percentage >= 80
                                      ? 'bg-success/10 text-success'
                                      : entry.percentage >= 50
                                      ? 'bg-data-4/10 text-data-4'
                                      : 'bg-destructive/10 text-destructive'
                                  }`}
                                >
                                  {entry.percentage}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Question-wise Analysis ── */}
            {questionStats && questionStats.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart2 className="h-4 w-4 text-brand" />
                    Question-wise Analysis
                  </CardTitle>
                  <CardDescription>
                    Accuracy breakdown per question
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questionStats.map((q, i) => {
                    const pct =
                      typeof q.correctPct === 'number' && q.correctPct <= 1
                        ? Number((q.correctPct * 100).toFixed(1))
                        : Number(q.correctPct ?? 0);

                    return (
                      <div key={q.questionId} className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            <span className="mr-1.5 text-ink-muted">Q{i + 1}.</span>
                            {q.text || 'Untitled question'}
                          </p>
                          <span className="shrink-0 text-xs text-ink-muted tabular-nums">
                            {q.total} attempt{q.total !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                            <div
                              className="h-full rounded-full bg-data-4 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                            {pct}%
                          </span>
                        </div>

                        <div className="flex gap-4 text-xs text-ink-muted">
                          <span className="flex items-center gap-1 text-success">
                            <CheckCircle2 className="h-3 w-3" />
                            {q.correct} correct
                          </span>
                          <span className="flex items-center gap-1 text-destructive">
                            <XCircle className="h-3 w-3" />
                            {q.incorrect ?? q.total - q.correct} incorrect
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* ── Score Distribution Chart ── */}
            {scoreDistribution.length > 1 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Score Distribution</CardTitle>
                  <CardDescription>
                    Number of participants per score range
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={scoreDistribution}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [
                          `${value} participant${Number(value) !== 1 ? 's' : ''}`,
                          'Count',
                        ]}
                      />
                      <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                        {scoreDistribution.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
