"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Download,
  Users,
  MessageSquare,
  Activity,
  BarChart2,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  ActionGroup,
  BackLink as SharedBackLink,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadingSkeleton,
  MetricCard,
  PageHeader,
  StatusBadge,
} from "@/components/ui";
import { useAnalytics, downloadReport } from "@/hooks/use-analytics";
import { useEvent } from "@/lib/use-events";
import { apiFetch } from "@/lib/events-api";
import { notify } from "@/lib/notification-store";

const CHART_COLORS = [
  "var(--data-1)",
  "var(--data-2)",
  "var(--data-3)",
  "var(--data-4)",
  "var(--data-5)",
  "var(--data-6)",
];

const chartAxisTick = { fontSize: 11, fill: "var(--text-muted)" };
const chartSmallAxisTick = { fontSize: 10, fill: "var(--text-muted)" };
const chartTooltipStyle = {
  background: "var(--surface-card)",
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  color: "var(--text-primary)",
} as const;

function formatPercentFromRatio(value: number | null | undefined) {
  return `${(value ?? 0).toFixed(1)}%`;
}

function PollChart({
  poll,
}: {
  poll: import("@/hooks/use-analytics").PollAnalytic;
}) {
  if (poll.pollType === "open") {
    return (
      <div className="space-y-1 text-sm">
        {(poll.responses ?? []).slice(0, 20).map((r, i) => (
          <p
            key={i}
            className="rounded-md bg-muted/50 px-3 py-1.5 text-muted-foreground"
          >
            {r}
          </p>
        ))}
        {(poll.responses?.length ?? 0) > 20 && (
          <p className="text-xs text-muted-foreground">
            +{(poll.responses?.length ?? 0) - 20} more responses
          </p>
        )}
      </div>
    );
  }

  if (poll.pollType === "rating") {
    const distributionSource = poll.distribution ?? {};
    const data = Array.isArray(distributionSource)
      ? distributionSource.map((d: any) => ({
        name: `★ ${d.rating}`,
        count: d.count,
      }))
      : Object.entries(distributionSource).map(([rating, count]) => ({
        name: `★ ${rating}`,
        count: Number(count),
      }));

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Average:{" "}
          <span className="font-semibold text-foreground">
            {poll.average?.toFixed(1) ?? "0.0"}
          </span>
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-default)"
            />
            <XAxis
              dataKey="name"
              tick={chartAxisTick}
              tickLine={false}
              axisLine={{ stroke: "var(--border-default)" }}
            />
            <YAxis
              allowDecimals={false}
              tick={chartAxisTick}
              tickLine={false}
              axisLine={{ stroke: "var(--border-default)" }}
            />
            <Tooltip
              formatter={(value) => [
                `${Array.isArray(value) ? value.join(", ") : (value ?? 0)} responses`,
                "Count",
              ]}
              cursor={{ fill: "var(--surface-offset)" }}
              contentStyle={chartTooltipStyle}
            />
            <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const data = (poll.options ?? []).map((o) => ({
    name: o.label.length > 20 ? `${o.label.slice(0, 20)}…` : o.label,
    fullName: o.label,
    count: o.count,
    pct: Number(((o.percentage ?? 0) * 100).toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 30, left: 8, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          stroke="var(--border-default)"
        />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={chartAxisTick}
          tickLine={false}
          axisLine={{ stroke: "var(--border-default)" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={chartAxisTick}
          tickLine={false}
          axisLine={{ stroke: "var(--border-default)" }}
          width={120}
        />
        <Tooltip
          formatter={(value, _name, item) => [
            `${Array.isArray(value) ? value.join(", ") : (value ?? 0)} (${item?.payload?.pct ?? 0}%)`,
            "Responses",
          ]}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
          cursor={{ fill: "var(--surface-offset)" }}
          contentStyle={chartTooltipStyle}
        />
        <Bar dataKey="count" radius={[0, 3, 3, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function WordCloudDisplay({
  words,
}: {
  words: import("@/hooks/use-analytics").WordEntry[];
}) {
  const max = words[0]?.weight ?? 1;

  return (
    <div className="flex flex-wrap gap-2">
      {words.slice(0, 60).map((w) => {
        const scale = 0.75 + (w.weight / max) * 1.25;
        return (
          <span
            key={w.text}
            style={{
              fontSize: `${scale}rem`,
              opacity: 0.5 + (w.weight / max) * 0.5,
            }}
            className="font-display font-semibold leading-tight text-brand"
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
}

function QuizLeaderboard({
  quiz,
}: {
  quiz: import("@/hooks/use-analytics").QuizAnalytic;
}) {
  return (
    <div className="space-y-2">
      {quiz.leaderboard.slice(0, 10).map((entry, i) => {
        const anonId =
          (entry as any).participantAnonId ??
          (entry as any).anonId ??
          "anonymous";
        const displayName = (entry as any).displayName;
        const participantName =
          typeof displayName === "string" && displayName.trim().length > 0
            ? displayName.trim()
            : `Participant ${String(anonId).slice(0, 6)}`;
        const points = (entry as any).totalPoints ?? (entry as any).points ?? 0;

        return (
          <div
            key={`${anonId}-${i}`}
            className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="w-5 text-muted-foreground tabular-nums">
                {i + 1}.
              </span>
              <span className="font-medium text-foreground">
                {participantName}
              </span>
            </span>
            <span className="font-semibold tabular-nums">{points} pts</span>
          </div>
        );
      })}
      {quiz.leaderboard.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No quiz responses recorded.
        </p>
      )}
    </div>
  );
}

function FeedbackSection({
  feedback,
}: {
  feedback: import("@/hooks/use-analytics").FeedbackAnalytic;
}) {
  return (
    <div className="space-y-4">
      {feedback.fields.map((field) =>
        field.type === "rating" ? (
          <div key={field.fieldId} className="space-y-1">
            <p className="text-sm font-medium">{field.label}</p>
            <p className="text-xs text-muted-foreground">
              Average:{" "}
              <span className="font-semibold text-foreground">
                {field.average.toFixed(1)}
              </span>{" "}
              ({field.count} responses)
            </p>
            <div className="flex gap-1">
              {Object.entries(field.distribution ?? {})
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([rating, count]) => {
                  const numericCount = Number(count);
                  const ratio =
                    field.count > 0 ? numericCount / field.count : 0;

                  return (
                    <div key={rating} className="text-center text-xs">
                      <div
                        className="mx-auto w-8 rounded-sm bg-data-3"
                        style={{ height: `${Math.max(4, ratio * 48)}px` }}
                      />
                      <span className="text-muted-foreground">{rating}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div key={field.fieldId} className="space-y-1">
            <p className="text-sm font-medium">{field.label}</p>
            <div className="space-y-1">
              {field.responses.slice(0, 10).map((r, i) => (
                <p
                  key={i}
                  className="rounded-md bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {r}
                </p>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function EngagementTimeline({
  data,
}: {
  data: import("@/hooks/use-analytics").TimelineBucket[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No timeline data available.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    time: new Date(d.minute).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    responses: d.responses,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={chartData}
        margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
        <XAxis
          dataKey="time"
          tick={chartSmallAxisTick}
          tickLine={false}
          axisLine={{ stroke: "var(--border-default)" }}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={chartSmallAxisTick}
          tickLine={false}
          axisLine={{ stroke: "var(--border-default)" }}
        />
        <Tooltip
          cursor={{ stroke: "var(--border-strong)" }}
          contentStyle={chartTooltipStyle}
        />
        <Line
          type="monotone"
          dataKey="responses"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton variant="text" className="h-5 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
      <LoadingSkeleton variant="card" className="h-48" />
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <LoadingSkeleton key={i} variant="card" className="h-40" />
        ))}
      </div>
    </div>
  );
}

export interface AiReportData {
  executiveSummary: string;
  keyInsights: string[];
  audienceBehaviour: {
    participationRate: string;
    dropOffPoints: string;
    mostActiveTime: string;
  };
  activityAnalysis: {
    pollPerformance: string;
    quizPerformance: string;
    wordCloudHighlights: string;
    feedbackHighlights: string;
    qaTrends: string;
  };
  recommendations: string[];
  engagementScore: {
    score: number;
    explanation: string;
  };
}

export default function AnalyticsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: event } = useEvent(id);
  const { data: report, isLoading, isError, error } = useAnalytics(id);
  const [downloading, setDownloading] = React.useState<"csv" | "pdf" | null>(
    null,
  );

  const [aiReport, setAiReport] = React.useState<AiReportData | null>(() => {
    if (typeof window !== "undefined" && id) {
      const cached = sessionStorage.getItem(`ai-report-${id}`);
      if (cached) {
        try {
          return JSON.parse(cached) as AiReportData;
        } catch (e) {
          // ignore cache parse error
        }
      }
    }
    return null;
  });
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);

  const handleDownload = async (format: "csv" | "pdf") => {
    if (!id) return;

    setDownloading(format);
    notify({
      type: "analytics-export-started",
      description: `${format.toUpperCase()} analytics export started.`,
      href: `/dashboard/events/${id}/analytics`,
    });
    try {
      await downloadReport(id, format);
      notify({
        type: "analytics-export-completed",
        title: `${format.toUpperCase()} Report Ready`,
        description: "Your analytics report has been generated.",
        href: `/dashboard/events/${id}/analytics`,
        download: {
          path: `events/${id}/report.${format}`,
          filename: `event-report-${id}.${format}`,
        },
        groupKey: `analytics-export-completed-${format}`,
      });
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) return <AnalyticsSkeleton />;

  if (isError || !report) {
    return (
      <div className="space-y-4">
        <SharedBackLink href={`/dashboard/events/${id}`}>
          Back to event
        </SharedBackLink>
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              Could not load analytics
            </CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "Analytics not yet available."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const {
    headlineStats,
    pollAnalytics,
    quizAnalytics,
    qaAnalytics,
    wordCloudAnalytics,
    feedbackAnalytics,
    engagementTimeline,
  } = report;

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);

      const analyticsData = `
Participants: ${headlineStats?.totalParticipants ?? 0}
Responses: ${headlineStats?.totalResponses ?? 0}
Participation Rate: ${formatPercentFromRatio(headlineStats?.participationRate)}
Questions Asked: ${qaAnalytics?.totalQuestions ?? 0}
Word Clouds: ${wordCloudAnalytics?.length ?? 0}
Feedback Forms: ${feedbackAnalytics?.length ?? 0}
Quizzes: ${quizAnalytics?.length ?? 0}
Polls: ${pollAnalytics?.length ?? 0}
`;

      const result = await apiFetch<AiReportData>(
        "ai/generate-analytics-report",
        {
          method: "POST",
          body: JSON.stringify({ data: analyticsData }),
        },
      );
      
      setAiReport(result);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`ai-report-${id}`, JSON.stringify(result));
      }
      
      notify({
        type: "ai-report-completed",
        description: "AI completed the comprehensive session report.",
        href: `/dashboard/events/${id}/analytics`,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        leading={
          <SharedBackLink href={`/dashboard/events/${id}`}>
            Back to event
          </SharedBackLink>
        }
        eyebrow="Session report"
        title={`${event?.name ?? "Event"} analytics`}
        description={`Generated ${new Date(report.generatedAt).toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "medium",
          },
        )}`}
        badge={
          <StatusBadge
            status={event?.status ?? "ended"}
            className="capitalize"
          />
        }
        actions={
          <ActionGroup>
            <Button
              variant={aiReport ? "outline" : "ai"}
              size="sm"
              disabled={isGeneratingReport}
              onClick={handleGenerateReport}
              loading={isGeneratingReport}
            >
              <Sparkles className="h-4 w-4" />
              {aiReport ? "Regenerate AI Report" : "✨ Generate AI Report"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={downloading === "csv"}
              onClick={() => handleDownload("csv")}
            >
              <Download className="h-4 w-4" />
              {downloading === "csv" ? "Exporting..." : "CSV"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={downloading === "pdf"}
              onClick={() => handleDownload("pdf")}
            >
              <Download className="h-4 w-4" />
              {downloading === "pdf" ? "Exporting..." : "PDF"}
            </Button>
          </ActionGroup>
        }
      />

      {aiReport && (
        <Card className="border-ai-border bg-surface-card shadow-md">
          <CardHeader className="border-b border-border bg-background/50 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Sparkles className="h-6 w-6 text-ai" />
                  AI Session Report
                </CardTitle>
                <CardDescription className="mt-1">
                  Comprehensive analytics and insights generated by AI
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-right">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                    Engagement Score
                  </span>
                  <span className="text-3xl font-bold text-brand">
                    {aiReport.engagementScore.score}/100
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-8 p-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Executive Summary
              </h3>
              <p className="text-sm leading-relaxed text-ink-secondary">
                {aiReport.executiveSummary}
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Key Insights
              </h3>
              <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-ink-secondary">
                {aiReport.keyInsights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Audience Behaviour
              </h3>
              <div className="grid gap-2 text-sm text-ink-secondary">
                <p><span className="font-medium text-foreground">Participation Rate:</span> {aiReport.audienceBehaviour.participationRate}</p>
                <p><span className="font-medium text-foreground">Most Active Time:</span> {aiReport.audienceBehaviour.mostActiveTime}</p>
                <p><span className="font-medium text-foreground">Drop-off Points:</span> {aiReport.audienceBehaviour.dropOffPoints}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Activity Analysis
              </h3>
              <div className="grid gap-2 text-sm text-ink-secondary">
                <p><span className="font-medium text-foreground">Polls:</span> {aiReport.activityAnalysis.pollPerformance}</p>
                <p><span className="font-medium text-foreground">Quizzes:</span> {aiReport.activityAnalysis.quizPerformance}</p>
                <p><span className="font-medium text-foreground">Q&A:</span> {aiReport.activityAnalysis.qaTrends}</p>
              </div>
            </div>

            <div className="col-span-full space-y-4 border-t border-border pt-6">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Recommendations
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {aiReport.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-md bg-surface-raised p-4 text-sm text-ink-secondary shadow-xs border border-border">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Participants"
          value={headlineStats.totalParticipants}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Participation rate"
          value={formatPercentFromRatio(headlineStats.participationRate)}
          description={`${headlineStats.uniqueResponders} of ${headlineStats.totalParticipants} responded`}
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          label="Total responses"
          value={headlineStats.totalResponses}
          icon={<BarChart2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Questions asked"
          value={qaAnalytics.totalQuestions}
          description={`${qaAnalytics.answeredQuestions} answered`}
          icon={<MessageSquare className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Engagement timeline</CardTitle>
          <CardDescription>
            Responses per minute throughout the session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EngagementTimeline data={engagementTimeline} />
        </CardContent>
      </Card>

      {pollAnalytics.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Polls
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {pollAnalytics.map((poll) => (
              <Card key={poll.activityId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {poll.title}
                  </CardTitle>
                  <CardDescription>
                    {poll.totalResponses} response
                    {poll.totalResponses !== 1 ? "s" : ""} · {poll.pollType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PollChart poll={poll} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {quizAnalytics.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Quizzes
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {quizAnalytics.map((quiz) => (
              <Card key={quiz.activityId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription>
                    {quiz.questionStats.length} question
                    {quiz.questionStats.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <QuizLeaderboard quiz={quiz} />
                  {quiz.questionStats.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Correct answer rate per question
                      </p>
                      <div className="space-y-1">
                        {quiz.questionStats.map((q, i) => {
                          const pct =
                            typeof q.correctPct === "number" &&
                              q.correctPct <= 1
                              ? Number((q.correctPct * 100).toFixed(1))
                              : Number(q.correctPct ?? 0);

                          return (
                            <div
                              key={q.questionId}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span className="w-16 shrink-0 text-muted-foreground">
                                Q{i + 1}
                              </span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                                <div
                                  className="h-full rounded-full bg-data-4"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-12 text-right tabular-nums">
                                {pct}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {wordCloudAnalytics.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Word clouds
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {wordCloudAnalytics.map((wc) => (
              <Card key={wc.activityId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {wc.title}
                  </CardTitle>
                  <CardDescription>{wc.prompt}</CardDescription>
                </CardHeader>
                <CardContent>
                  {wc.words.length > 0 ? (
                    <WordCloudDisplay words={wc.words} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No words submitted.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {feedbackAnalytics.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Feedback
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {feedbackAnalytics.map((fb) => (
              <Card key={fb.activityId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {fb.title}
                  </CardTitle>
                  <CardDescription>
                    {fb.totalResponses} response
                    {fb.totalResponses !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FeedbackSection feedback={fb} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {qaAnalytics.topQuestions.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Top questions
          </h2>
          <Card>
            <CardContent className="space-y-2 pt-4">
              {qaAnalytics.topQuestions.map((q, index) => (
                <div
                  key={(q as any)._id ?? `${q.text}-${q.voteCount}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                >
                  <p className="flex-1">{q.text}</p>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    <span className="tabular-nums">{q.voteCount} votes</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 capitalize">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
