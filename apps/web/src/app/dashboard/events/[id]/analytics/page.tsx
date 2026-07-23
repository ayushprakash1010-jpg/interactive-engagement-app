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
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Star,
  StarHalf,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Trophy,
  Copy,
  Check,
  Brain,
  Cloud,
  MessageCircle,
  ClipboardList,
  HelpCircle,
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
  VideoCallout,
} from "@/components/ui";
import { useAnalytics, downloadReport } from "@/hooks/use-analytics";
import { useEvent } from "@/lib/use-events";
import { apiFetch } from "@/lib/events-api";
import { notify } from "@/lib/notification-store";
import { WordCloud } from "@/components/wordcloud/wordcloud-cloud";
import { getVideoByFeature } from "@/lib/tutorial-videos";

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
      <div className="space-y-3">
        {(poll.responses ?? []).slice(0, 20).map((r, i) => (
          <div
            key={i}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-muted/30 border border-border/50 px-4 py-2.5 text-sm text-foreground leading-relaxed shadow-sm">
              {r}
            </div>
          </div>
        ))}
        {(poll.responses?.length ?? 0) > 20 && (
          <div className="flex items-center gap-2 pl-9">
            <div className="h-[1px] flex-1 bg-border/50"></div>
            <p className="text-xs text-muted-foreground font-medium">
              +{(poll.responses?.length ?? 0) - 20} more responses
            </p>
            <div className="h-[1px] flex-1 bg-border/50"></div>
          </div>
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
          <div key={field.fieldId} className="space-y-2 rounded-lg border bg-surface-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{field.label}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {field.average.toFixed(1)}
                </span>{" "}
                ({field.count} responses)
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => {
                if (field.average >= star - 0.25) {
                  return <Star key={star} className="h-6 w-6 fill-current" strokeWidth={1.5} />;
                } else if (field.average >= star - 0.75) {
                  return <StarHalf key={star} className="h-6 w-6 fill-current" strokeWidth={1.5} />;
                } else {
                  return <Star key={star} className="h-6 w-6 text-muted-foreground/30" strokeWidth={1.5} />;
                }
              })}
            </div>
          </div>
        ) : (
          <div key={field.fieldId} className="space-y-3">
            <p className="text-sm font-medium">{field.label}</p>
            <div className="space-y-3">
              {field.responses.slice(0, 10).map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted/30 border border-border/50 px-4 py-2.5 text-sm text-foreground leading-relaxed shadow-sm">
                    {r}
                  </div>
                </div>
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

function SurveySection({
  survey,
}: {
  survey: import("@/hooks/use-analytics").SurveyAnalytic;
}) {
  const [view, setView] = React.useState<"aggregate" | "individual">("aggregate");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const individuals = survey.individualResponses ?? [];

  // Build a lookup map from questionId → question metadata (title + options)
  const questionById = React.useMemo(() => {
    const map = new Map<string, typeof survey.questions[0]>();
    for (const q of survey.questions) {
      if (q.questionId) map.set(q.questionId, q);
    }
    return map;
  }, [survey.questions]);

  const formatDuration = (sec?: number) => {
    if (!sec) return "—";
    if (sec < 60) return `${Math.round(sec)}s`;
    return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
  };

  const renderAnswerValue = (questionId: string, answer: any): string => {
    if (answer === null || answer === undefined) return "No answer";
    const q = questionById.get(questionId);
    if (typeof answer === "string") return answer.trim() || "No answer";
    if (typeof answer === "number") return `${answer}`;
    if (Array.isArray(answer)) {
      if (q?.options && q.options.length > 0) {
        return answer
          .map((id) => (q.options as any[]).find((o) => o.id === id)?.label ?? id)
          .join(", ") || "No answer";
      }
      return answer.join(", ") || "No answer";
    }
    return String(answer) || "No answer";
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border p-3">
          <p className="text-xs font-medium text-muted-foreground">Completion Rate</p>
          <p className="text-2xl font-bold">{survey.completionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{survey.totalCompleted} of {survey.totalStarted} completed</p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-xs font-medium text-muted-foreground">Avg. Completion Time</p>
          <p className="text-2xl font-bold">{formatDuration(survey.averageCompletionTimeSec)}</p>
          <p className="text-xs text-muted-foreground mt-1">{survey.abandonmentRate}% abandonment</p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-xs font-medium text-muted-foreground">Total Respondents</p>
          <p className="text-2xl font-bold">{individuals.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{individuals.filter(r => r.status === "completed").length} fully completed</p>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        <button
          type="button"
          onClick={() => setView("aggregate")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            view === "aggregate"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Aggregate Results
        </button>
        <button
          type="button"
          onClick={() => setView("individual")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            view === "individual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3 w-3" />
          Individual Responses
          {individuals.length > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary font-semibold">
              {individuals.length}
            </span>
          )}
        </button>
      </div>

      {/* Aggregate view */}
      {view === "aggregate" && (
        <div className="space-y-4">
          {survey.questions.map((q, i) => (
            <div key={`${q.activityId}-${i}`} className="space-y-2 border-t pt-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="text-sm font-medium leading-snug">
                  <span className="text-muted-foreground mr-2">Q{i + 1}.</span>
                  {q.title}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
                  {q.totalResponses} res
                </span>
              </div>
              <PollChart poll={q} />
            </div>
          ))}
        </div>
      )}

      {/* Individual responses view */}
      {view === "individual" && (
        <div className="space-y-2">
          {individuals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
              <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No responses yet</p>
            </div>
          ) : (
            individuals.map((resp, idx) => {
              const displayName = resp.displayName ?? `Participant ${resp.participantAnonId.slice(0, 6)}`;
              const isExpanded = expandedId === resp.participantAnonId;
              const answerEntries = Object.entries(resp.answers ?? {});

              return (
                <div
                  key={resp.participantAnonId}
                  className="rounded-lg border overflow-hidden transition-shadow hover:shadow-sm"
                >
                  {/* Header row */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : resp.participantAnonId)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{resp.participantAnonId.slice(0, 12)}…</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {resp.status === "completed" ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          Abandoned
                        </span>
                      )}
                      {resp.durationSec !== undefined && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDuration(resp.durationSec)}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded answers */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20 px-4 py-3 space-y-3">
                      {answerEntries.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No answers recorded</p>
                      ) : (
                        answerEntries.map(([questionId, answer]) => {
                          const q = questionById.get(questionId);
                          const qNumber = q ? survey.questions.indexOf(q) + 1 : null;
                          const label = q
                            ? `Q${qNumber}. ${q.title}`
                            : `Question ${questionId.slice(0, 8)}…`;

                          return (
                            <div key={questionId} className="space-y-0.5">
                              <p className="text-xs font-medium text-muted-foreground">{label}</p>
                              <p className="text-sm">{renderAnswerValue(questionId, answer)}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
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
  topActivity?: {
    name: string;
    type: string;
    reason: string;
  };
  sentiment?: {
    label: string;
    emoji: string;
    summary: string;
  };
  activityHeatmap?: Array<{
    type: string;
    label: string;
    level: "high" | "medium" | "low" | "none";
    detail: string;
  }>;
  wentWell?: string[];
  needsImprovement?: string[];
  nextSteps?: string[];
  followUpSuggestion?: string;
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
  const [isExportMenuOpen, setIsExportMenuOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopyReport = React.useCallback(() => {
    if (!aiReport) return;
    const text = [
      `AI Session Report`,
      `Engagement Score: ${aiReport.engagementScore.score}/100`,
      ``,
      `Executive Summary`,
      aiReport.executiveSummary,
      ``,
      `Key Insights`,
      ...(aiReport.keyInsights ?? []).map((i) => `• ${i}`),
      ``,
      `What Went Well`,
      ...(aiReport.wentWell ?? []).map((i) => `✓ ${i}`),
      ``,
      `Needs Improvement`,
      ...(aiReport.needsImprovement ?? []).map((i) => `⚠ ${i}`),
      ``,
      `Next Steps`,
      ...(aiReport.nextSteps ?? []).map((i) => `→ ${i}`),
      ``,
      `Follow-up Action`,
      aiReport.followUpSuggestion ?? "",
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [aiReport]);

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
    surveyAnalytics,
    engagementTimeline,
  } = report;

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);

      const pollSummary = (pollAnalytics ?? [])
        .map((p) => `  - "${p.title}" (${p.pollType}): ${p.totalResponses} responses`)
        .join("\n");

      const quizSummary = (quizAnalytics ?? [])
        .map((q) => {
          const top = q.leaderboard?.[0];
          const topName = (top as any)?.displayName ?? "anonymous";
          const topPts = (top as any)?.totalPoints ?? 0;
          return `  - "${q.title}": ${q.leaderboard?.length ?? 0} participants, top score ${topPts} pts by ${topName}`;
        })
        .join("\n");

      const feedbackSummary = (feedbackAnalytics ?? [])
        .map((fb) => {
          const ratingFields = fb.fields
            .filter((f) => f.type === "rating")
            .map((f) => `${f.label}: avg ${f.average?.toFixed(1)}/5 (${f.count} responses)`)
            .join(", ");
          return `  - "${fb.title}": ${fb.totalResponses} responses${ratingFields ? ` | Ratings: ${ratingFields}` : ""}`;
        })
        .join("\n");

      const surveySummary = (surveyAnalytics ?? [])
        .map((s) => `  - "${s.title}": ${s.totalStarted} started, ${s.totalCompleted} completed (${s.totalStarted > 0 ? Math.round((s.totalCompleted / s.totalStarted) * 100) : 0}% completion rate)`)
        .join("\n");

      const qaSummary = `Total: ${qaAnalytics?.totalQuestions ?? 0}, Answered: ${qaAnalytics?.answeredQuestions ?? 0}`;

      const analyticsData = `
=== SESSION OVERVIEW ===
Total Participants: ${headlineStats?.totalParticipants ?? 0}
Unique Responders: ${headlineStats?.uniqueResponders ?? 0}
Participation Rate: ${formatPercentFromRatio(headlineStats?.participationRate)}
Total Responses: ${headlineStats?.totalResponses ?? 0}

=== ACTIVITY BREAKDOWN ===
Polls (${pollAnalytics?.length ?? 0} total):
${pollSummary || "  None"}

Quizzes (${quizAnalytics?.length ?? 0} total):
${quizSummary || "  None"}

Word Clouds: ${wordCloudAnalytics?.length ?? 0} activities

Feedback Forms (${feedbackAnalytics?.length ?? 0} total):
${feedbackSummary || "  None"}

Surveys (${surveyAnalytics?.length ?? 0} total):
${surveySummary || "  None"}

Q&A: ${qaSummary}
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
            <div
              className="relative"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsExportMenuOpen(false);
                }
              }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="gap-2"
                disabled={downloading !== null}
              >
                <Download className="h-4 w-4" />
                {downloading ? "Exporting..." : "Export"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 rounded-md border bg-surface-card p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => {
                      handleDownload("csv");
                      setIsExportMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    CSV format
                  </button>
                  <button
                    onClick={() => {
                      handleDownload("pdf");
                      setIsExportMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    PDF document
                  </button>
                </div>
              )}
            </div>
          </ActionGroup>
        }
      />

      {aiReport && (
        <Card className="border-ai-border bg-surface-card shadow-md overflow-hidden">
          {/* ── Header ─────────────────────────────────────── */}
          <CardHeader className="border-b border-border bg-background/50 pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Sparkles className="h-6 w-6 text-ai" />
                  AI Session Report
                </CardTitle>
                <CardDescription className="mt-1">
                  Comprehensive analytics and insights generated by AI
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy summary"}
                </button>
                {/* Score Ring */}
                <div className="flex flex-col items-center">
                  <div className="relative h-20 w-20">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-default)" strokeWidth="8" />
                      <circle
                        cx="40" cy="40" r="32" fill="none"
                        stroke={
                          aiReport.engagementScore.score >= 75 ? "var(--data-3)" :
                          aiReport.engagementScore.score >= 50 ? "var(--data-4)" : "var(--data-6)"
                        }
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - aiReport.engagementScore.score / 100)}`}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold tabular-nums leading-none">
                        {aiReport.engagementScore.score}
                      </span>
                      <span className="text-[10px] text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Engagement</span>
                </div>
              </div>
            </div>
            {/* Score explanation */}
            <p className="mt-3 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground italic border border-border/40">
              {aiReport.engagementScore.explanation}
            </p>
          </CardHeader>

          <CardContent className="grid gap-8 p-6 sm:grid-cols-2">

            {/* ── Executive Summary ──────────────────────────── */}
            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold text-foreground">Executive Summary</h3>
              <p className="text-sm leading-relaxed text-ink-secondary">{aiReport.executiveSummary}</p>
            </div>

            {/* ── Key Insights ────────────────────────────────── */}
            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold text-foreground">Key Insights</h3>
              <ul className="space-y-2">
                {aiReport.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Top Activity Spotlight ───────────────────── */}
            {aiReport.topActivity && (
              <div className="col-span-full rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Best Activity: <span className="text-amber-500">{aiReport.topActivity.name}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{aiReport.topActivity.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Activity Heatmap ─────────────────────────── */}
            {aiReport.activityHeatmap && aiReport.activityHeatmap.length > 0 && (
              <div className="col-span-full space-y-3">
                <h3 className="font-display text-base font-semibold text-foreground">Activity Engagement</h3>
                <div className="flex flex-wrap gap-3">
                  {aiReport.activityHeatmap.filter(a => a.level !== "none").map((a) => {
                    const levelColor = {
                      high: "bg-data-3/20 border-data-3/40 text-data-3",
                      medium: "bg-data-4/20 border-data-4/40 text-data-4",
                      low: "bg-muted/40 border-border text-muted-foreground",
                      none: "opacity-30 bg-muted/20 border-border text-muted-foreground",
                    }[a.level];
                    const dotColor = {
                      high: "bg-data-3",
                      medium: "bg-data-4",
                      low: "bg-muted-foreground",
                      none: "bg-muted-foreground/30",
                    }[a.level];
                    return (
                      <div key={a.type} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${levelColor}`}>
                        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                        <span>{a.label}</span>
                        {a.detail && <span className="opacity-70">· {a.detail}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Sentiment ────────────────────────────────── */}
            {aiReport.sentiment && (
              <div className="space-y-3">
                <h3 className="font-display text-base font-semibold text-foreground">Audience Sentiment</h3>
                <div className="flex items-center gap-3 rounded-lg border bg-surface-card p-4">
                  <span className="text-3xl">{aiReport.sentiment.emoji}</span>
                  <div>
                    <p className="font-semibold text-foreground">{aiReport.sentiment.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{aiReport.sentiment.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Audience Behaviour ───────────────────────── */}
            <div className="space-y-3">
              <h3 className="font-display text-base font-semibold text-foreground">Audience Behaviour</h3>
              <div className="space-y-2 text-sm text-ink-secondary">
                <p><span className="font-medium text-foreground">Participation Rate: </span>{aiReport.audienceBehaviour.participationRate}</p>
                <p><span className="font-medium text-foreground">Most Active Time: </span>{aiReport.audienceBehaviour.mostActiveTime}</p>
                <p><span className="font-medium text-foreground">Drop-off Points: </span>{aiReport.audienceBehaviour.dropOffPoints}</p>
              </div>
            </div>

            {/* ── What Went Well / Needs Improvement ───────── */}
            {(aiReport.wentWell?.length || aiReport.needsImprovement?.length) ? (
              <div className="col-span-full grid gap-4 sm:grid-cols-2">
                {aiReport.wentWell?.length ? (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 space-y-2">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      What Went Well
                    </h4>
                    <ul className="space-y-1.5">
                      {aiReport.wentWell.map((item, i) => (
                        <li key={i} className="text-xs text-ink-secondary flex items-start gap-2">
                          <span className="mt-0.5 text-green-500">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {aiReport.needsImprovement?.length ? (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                      <AlertCircle className="h-4 w-4" />
                      Needs Improvement
                    </h4>
                    <ul className="space-y-1.5">
                      {aiReport.needsImprovement.map((item, i) => (
                        <li key={i} className="text-xs text-ink-secondary flex items-start gap-2">
                          <span className="mt-0.5 text-amber-500">⚠</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* ── Next Steps ────────────────────────────────── */}
            {aiReport.nextSteps?.length ? (
              <div className="space-y-3">
                <h3 className="font-display text-base font-semibold text-foreground">Next Steps</h3>
                <ol className="space-y-2">
                  {aiReport.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {/* ── Follow-up Suggestion ─────────────────────── */}
            {aiReport.followUpSuggestion && (
              <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand">💡 Do this now</p>
                <p className="text-sm text-ink-secondary">{aiReport.followUpSuggestion}</p>
              </div>
            )}

            {/* ── Recommendations ──────────────────────────── */}
            <div className="col-span-full space-y-4 border-t border-border pt-6">
              <h3 className="font-display text-lg font-semibold text-foreground">Recommendations</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {aiReport.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-md bg-surface-raised p-4 text-sm text-ink-secondary shadow-xs border border-border">
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Activity Analysis ────────────────────────── */}
            <div className="col-span-full space-y-3 border-t border-border pt-6">
              <h3 className="font-display text-base font-semibold text-foreground">Activity Analysis</h3>
              <div className="grid gap-2 text-sm text-ink-secondary sm:grid-cols-2">
                {aiReport.activityAnalysis.pollPerformance && <p><span className="font-medium text-foreground">Polls: </span>{aiReport.activityAnalysis.pollPerformance}</p>}
                {aiReport.activityAnalysis.quizPerformance && <p><span className="font-medium text-foreground">Quizzes: </span>{aiReport.activityAnalysis.quizPerformance}</p>}
                {aiReport.activityAnalysis.feedbackHighlights && <p><span className="font-medium text-foreground">Feedback: </span>{aiReport.activityAnalysis.feedbackHighlights}</p>}
                {aiReport.activityAnalysis.wordCloudHighlights && <p><span className="font-medium text-foreground">Word Clouds: </span>{aiReport.activityAnalysis.wordCloudHighlights}</p>}
                {aiReport.activityAnalysis.qaTrends && <p><span className="font-medium text-foreground">Q&A: </span>{aiReport.activityAnalysis.qaTrends}</p>}
              </div>
            </div>

          </CardContent>
        </Card>
      )}

      {/* Tutorial callout — subtle, contextual help for the analytics page */}
      {(() => {
        const video = getVideoByFeature('analytics');
        return video ? (
          <VideoCallout
            video={video}
            label="Understand your analytics — Watch the reports tutorial"
            className="mb-2"
          />
        ) : null;
      })()}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Participants"
          value={headlineStats.totalParticipants}
          icon={<Users className="h-4 w-4" />}
        />
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-ink-muted">Participation rate</p>
                <div className="font-display text-3xl font-bold leading-none tracking-tight text-foreground">
                  {formatPercentFromRatio(headlineStats.participationRate)}
                </div>
              </div>
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--surface-sunken)" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--brand)" strokeWidth="4"
                    strokeDasharray={`${(headlineStats.participationRate ?? 0) * 100} ${100 - ((headlineStats.participationRate ?? 0) * 100)}`}
                    strokeDashoffset="0" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <span>{headlineStats.uniqueResponders} of {headlineStats.totalParticipants} responded</span>
            </div>
          </CardContent>
        </Card>
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
                              className="flex items-center justify-between gap-3 text-sm py-2 border-b border-border/40 last:border-0 last:pb-0"
                            >
                              <span className="w-8 shrink-0 font-medium text-muted-foreground">
                                Q{i + 1}
                              </span>
                              <div className="flex-1" />
                              <div className="flex items-center gap-2.5">
                                <span className="tabular-nums font-semibold text-foreground text-right w-10">
                                  {pct}%
                                </span>
                                <div className="relative h-5 w-5 shrink-0">
                                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--surface-sunken)" strokeWidth="6" />
                                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={pct >= 50 ? "var(--data-3)" : "var(--data-6)"} strokeWidth="6"
                                      strokeDasharray={`${pct} ${100 - pct}`}
                                      strokeDashoffset="0" />
                                  </svg>
                                </div>
                              </div>
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
                    <WordCloud words={wc.words} height={260} />
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

      {surveyAnalytics?.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Surveys
          </h2>
          <div className="grid gap-6">
            {surveyAnalytics.map((survey) => (
              <Card key={survey.activityId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {survey.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground font-medium">{survey.totalCompleted} completed</span>
                      <span>of {survey.totalStarted} started</span>
                    </div>
                    {survey.totalStarted > 0 && (
                      <div className="relative h-8 w-8 ml-auto shrink-0">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--surface-sunken)" strokeWidth="4" />
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--data-3)" strokeWidth="4"
                            strokeDasharray={`${(survey.totalCompleted / survey.totalStarted) * 100} ${100 - (survey.totalCompleted / survey.totalStarted) * 100}`}
                            strokeDashoffset="0" />
                        </svg>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SurveySection survey={survey} />
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
                  className="flex items-start justify-between gap-4 rounded-lg border bg-surface-card px-4 py-3 text-sm shadow-sm transition-colors hover:bg-muted/20"
                >
                  <p className="flex-1 font-medium leading-relaxed">{q.text}</p>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="flex items-center gap-1.5 tabular-nums text-foreground font-semibold text-sm">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      {q.voteCount}
                    </span>
                    <div className="flex items-center gap-1.5 border-l pl-3 border-border/50">
                      {q.status === "dismissed" && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Dismissed
                        </span>
                      )}
                      {q.status === "answered" && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Answered
                        </span>
                      )}
                      {q.status !== "dismissed" && q.status !== "answered" && (
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                          Open
                        </span>
                      )}
                    </div>
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
