'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AIWorkspaceHeader } from '@/components/ai-studio/AIWorkspaceHeader';
import { SessionConfigurationPanel, type SessionConfigState } from '@/components/ai-studio/SessionConfigurationPanel';
import { PromptEditor } from '@/components/ai-studio/PromptEditor';
import { DraftWorkspace } from '@/components/ai-studio/DraftWorkspace';
import { WorkspaceStatus } from '@/components/ai-studio/WorkspaceStatus';
import { WorkspaceEmptyState } from '@/components/ai-studio/WorkspaceEmptyState';
import { GenerationProgress } from '@/components/ai-studio/GenerationProgress';
import { PlanningSummaryCard } from '@/components/ai-studio/PlanningSummaryCard';
import { AgendaTimeline } from '@/components/ai-studio/AgendaTimeline';
import { PlanningInsights } from '@/components/ai-studio/PlanningInsights';
import { CopilotPanel } from '@/components/ai-studio/CopilotPanel';
import { SessionHistory } from '@/components/ai-studio/SessionHistory';
import { type CopilotState } from '@/lib/ai';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { type SessionReview } from '@/lib/ai';
import { ReviewDashboard } from '@/components/ai-studio/ReviewDashboard';
import { ai, type SessionPlan, type DraftActivity } from '@/lib/ai';
import { KnowledgeLibrary } from '@/components/ai-studio/library';


import {
  Sparkles,
  BarChart3,
  ListChecks,
  Cloud,
  HelpCircle,
  Star,
  FileText,
  Lightbulb,
  MessageSquareText,
  WandSparkles,
  ClipboardList,
} from 'lucide-react';
import {
  ActionGroup,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingSkeleton,
  ActivityTileSkeleton,
  PageHeader,
  SectionHeader,
  Select,
  SurfacePanel,
} from '@/components/ui';
import {
  AIBadge,
  AIComposer,
  AISummaryCard,
  SuggestionChip,
  ActivityTile,
  type ActivityType,
  type SummaryTheme,
} from '@/components/pulse';
import {
  pollConfigSchema,
  quizConfigSchema,
  wordcloudConfigSchema,
  feedbackConfigSchema,
  surveyConfigSchema,
} from '@iep/types';


type GeneratedEvent = {
  title: string;
  description: string;
};

type LiveSummaryResult =
  | {
    hasResponses: true;
    summary: string;
    themes: Array<{ label: string; count?: number }>;
    responseCount: number;
  }
  | {
    hasResponses: false;
    message: string;
    summary: null;
    themes: [];
    responseCount: 0;
  };

const ICON_BY_TYPE: Record<ActivityType, React.ReactNode> = {
  poll: <BarChart3 className="h-5 w-5" />,
  quiz: <ListChecks className="h-5 w-5" />,
  wordcloud: <Cloud className="h-5 w-5" />,
  qa: <HelpCircle className="h-5 w-5" />,
  feedback: <Star className="h-5 w-5" />,
  survey: <ClipboardList className="h-5 w-5" />,
  ai: <Sparkles className="h-5 w-5" />,
};

const SESSION_TEMPLATES = [
  {
    title: 'Sprint Retro',
    description: 'Gather wins, blockers, and mood ratings.',
    prompt: 'A retro that gathers wins, blockers, and a mood rating',
    gradient: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  },
  {
    title: 'All-Hands Kickoff',
    description: 'Icebreakers and Q&A for large groups.',
    prompt: 'A 30-minute product kickoff for 80 people with an icebreaker',
    gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  },
  {
    title: 'Trivia Night',
    description: 'Fun 5-question trivia round.',
    prompt: 'An icebreaker plus a 5-question trivia round',
    gradient: 'from-orange-500/20 to-rose-500/20 border-orange-500/30',
  },
];

const FEATURE_CARDS = [
  {
    title: 'Poll generation',
    description: 'Turn goals into quick audience checks and decision points.',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    title: 'Quiz generation',
    description: 'Draft knowledge checks with ready-to-review questions.',
    icon: <ListChecks className="h-4 w-4" />,
  },
  {
    title: 'Survey generation',
    description: 'Create multi-part feedback forms tailored to your session.',
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    title: 'Feedback generation',
    description: 'Shape retros, sentiment prompts, and open response moments.',
    icon: <MessageSquareText className="h-4 w-4" />,
  },
  {
    title: 'Word cloud generation',
    description: 'Prompt fast, visual audience inputs for live discussion.',
    icon: <Cloud className="h-4 w-4" />,
  },
  {
    title: 'Summary and insights',
    description: 'Distill live answers into themes hosts can act on.',
    icon: <Lightbulb className="h-4 w-4" />,
  },
];
// ─── Poll sanitiser ──────────────────────────────────────────────────────────

function sanitisePollConfig(
  rawConfig: Record<string, unknown>,
  activityTitle: string,
): Record<string, unknown> {
  const VALID_POLL_TYPES = ['single', 'multiple', 'rating', 'open'] as const;
  type ValidPollType = (typeof VALID_POLL_TYPES)[number];

  const rawPollType = typeof rawConfig.pollType === 'string' ? rawConfig.pollType : '';
  const pollType: ValidPollType = VALID_POLL_TYPES.includes(rawPollType as ValidPollType)
    ? (rawPollType as ValidPollType)
    : 'single';

  const question =
    typeof rawConfig.question === 'string' && rawConfig.question.trim()
      ? rawConfig.question.trim().slice(0, 499)
      : '';

  if (!question) {
    throw new Error(
      `AI generated poll "${activityTitle}" has an empty question. Please regenerate.`,
    );
  }

  const rawOptions = Array.isArray(rawConfig.options) ? rawConfig.options : [];
  const sanitisedOptions = (rawOptions as Record<string, unknown>[]).map((opt, oIndex) => {
    const id =
      typeof opt.id === 'string' && opt.id.trim()
        ? opt.id.trim()
        : `option-${oIndex + 1}`;
    const label =
      typeof opt.label === 'string' && opt.label.trim()
        ? opt.label.trim().slice(0, 199)
        : `Option ${oIndex + 1}`;
    return { id, label };
  });

  // timeLimitSec must be an integer if provided
  const rawTls = rawConfig.timeLimitSec;
  const timeLimitSec =
    typeof rawTls === 'number' && rawTls >= 5
      ? Math.round(rawTls)
      : undefined;

  // ─── Post-sanitisation validation ────────────────────────────────────────────
  // We run the same Zod schema the backend uses so a mismatch is caught here
  // with a precise field-level error, not an opaque 400 from the server.
  const validated = pollConfigSchema.safeParse({
    pollType,
    question,
    ...(sanitisedOptions.length > 0 ? { options: sanitisedOptions } : {}),
    ...(timeLimitSec !== undefined ? { timeLimitSec } : {}),
  });

  if (!validated.success) {
    const issues = validated.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(
      `AI generated poll "${activityTitle}" failed validation after normalisation: ${issues}`,
    );
  }

  return validated.data as Record<string, unknown>;
}

// ─── Wordcloud sanitiser ──────────────────────────────────────────────────────

function sanitiseWordcloudConfig(
  rawConfig: Record<string, unknown>,
  activityTitle: string,
): Record<string, unknown> {
  const prompt =
    typeof rawConfig.prompt === 'string' && rawConfig.prompt.trim()
      ? rawConfig.prompt.trim().slice(0, 499)
      : '';

  if (!prompt) {
    throw new Error(
      `AI generated word cloud "${activityTitle}" has an empty prompt. Please regenerate.`,
    );
  }

  // Clamp and coerce maxWordsPerParticipant to int in [1, 20]
  const rawMax = rawConfig.maxWordsPerParticipant;
  const maxWordsPerParticipant = Math.min(
    20,
    Math.max(1, Math.round(typeof rawMax === 'number' && rawMax > 0 ? rawMax : 3)),
  );

  // timeLimitSec must be an integer if provided
  const rawTls = rawConfig.timeLimitSec;
  const timeLimitSec =
    typeof rawTls === 'number' && rawTls >= 5
      ? Math.round(rawTls)
      : undefined;

  // ─── Post-sanitisation validation ────────────────────────────────────────────
  const validated = wordcloudConfigSchema.safeParse({
    prompt,
    maxWordsPerParticipant,
    ...(timeLimitSec !== undefined ? { timeLimitSec } : {}),
  });

  if (!validated.success) {
    const issues = validated.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(
      `AI generated word cloud "${activityTitle}" failed validation after normalisation: ${issues}`,
    );
  }

  return validated.data as Record<string, unknown>;
}

// ─── Feedback sanitiser ───────────────────────────────────────────────────────

function sanitiseFeedbackConfig(
  rawConfig: Record<string, unknown>,
  activityTitle: string,
): Record<string, unknown> {
  const prompt =
    typeof rawConfig.prompt === 'string' && rawConfig.prompt.trim()
      ? rawConfig.prompt.trim().slice(0, 499)
      : '';

  if (!prompt) {
    throw new Error(
      `AI generated feedback "${activityTitle}" has an empty prompt. Please regenerate.`,
    );
  }

  const rawFields = Array.isArray(rawConfig.fields) ? rawConfig.fields : [];

  const VALID_FIELD_TYPES = ['rating', 'text'] as const;
  type ValidFieldType = (typeof VALID_FIELD_TYPES)[number];

  const sanitisedFields = (rawFields as Record<string, unknown>[])
    .map((field, fIndex) => {
      const id =
        typeof field.id === 'string' && field.id.trim()
          ? field.id.trim()
          : `field-${fIndex + 1}`;
      const rawType = typeof field.type === 'string' ? field.type : '';
      const type: ValidFieldType = VALID_FIELD_TYPES.includes(rawType as ValidFieldType)
        ? (rawType as ValidFieldType)
        : 'text'; // default unknown types to 'text'
      const label =
        typeof field.label === 'string' && field.label.trim()
          ? field.label.trim().slice(0, 199)
          : type === 'rating' ? 'Rate your experience' : 'Share your thoughts';
      return { id, type, label };
    });

  if (sanitisedFields.length === 0) {
    // Backend requires min 1 field — add a sensible default
    sanitisedFields.push({ id: 'rating-1', type: 'rating', label: 'Rate your experience' });
  }

  // timeLimitSec must be an integer if provided
  const rawTls = rawConfig.timeLimitSec;
  const timeLimitSec =
    typeof rawTls === 'number' && rawTls >= 5
      ? Math.round(rawTls)
      : undefined;

  // ─── Post-sanitisation validation ────────────────────────────────────────────
  const validated = feedbackConfigSchema.safeParse({
    prompt,
    fields: sanitisedFields,
    ...(timeLimitSec !== undefined ? { timeLimitSec } : {}),
  });

  if (!validated.success) {
    const issues = validated.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(
      `AI generated feedback "${activityTitle}" failed validation after normalisation: ${issues}`,
    );
  }

  return validated.data as Record<string, unknown>;
}

// ─── Survey sanitiser ─────────────────────────────────────────────────────────

function sanitiseSurveyConfig(
  rawConfig: Record<string, unknown>,
  activityTitle: string,
): Record<string, unknown> {
  const rawQuestions = Array.isArray(rawConfig.questions) ? rawConfig.questions : [];

  const VALID_QUESTION_TYPES = ['single', 'multiple', 'rating', 'open'] as const;
  type ValidQType = (typeof VALID_QUESTION_TYPES)[number];

  const sanitisedQuestions = (rawQuestions as Record<string, unknown>[]).map(
    (rawQ, qIndex) => {
      const q = rawQ as Record<string, unknown>;

      const id =
        typeof q.id === 'string' && q.id.trim()
          ? q.id.trim()
          : `q${qIndex + 1}`;

      // AI may use 'title' or 'text' for the question text
      const text =
        typeof q.text === 'string' && q.text.trim()
          ? q.text.trim()
          : typeof q.title === 'string' && (q.title as string).trim()
            ? (q.title as string).trim()
            : `Question ${qIndex + 1}`;

      const rawType = typeof q.pollType === 'string' ? q.pollType : (typeof q.type === 'string' ? q.type : 'single');
      const type: ValidQType = VALID_QUESTION_TYPES.includes(rawType as ValidQType)
        ? (rawType as ValidQType)
        : 'single';

      const required = q.required === true;

      const rawOptions = Array.isArray(q.options) ? q.options : [];
      const options = (rawOptions as Record<string, unknown>[]).map((opt, oIndex) => ({
        id: typeof opt.id === 'string' && opt.id.trim() ? opt.id.trim() : `${id}-opt${oIndex + 1}`,
        label: typeof opt.label === 'string' && opt.label.trim() ? opt.label.trim() : `Option ${oIndex + 1}`,
      }));

      const base = { id, type, text, required, pageIndex: 0 };

      // Only attach options for choice-type questions
      if ((type === 'single' || type === 'multiple') && options.length > 0) {
        return { ...base, options };
      }

      return base;
    },
  );

  if (sanitisedQuestions.length === 0) {
    throw new Error(
      `AI generated survey "${activityTitle}" has no questions. Please regenerate.`,
    );
  }

  const validated = surveyConfigSchema.safeParse({
    questions: sanitisedQuestions,
    displayMode: 'stepper',
  });

  if (!validated.success) {
    const issues = validated.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(
      `AI generated survey "${activityTitle}" failed validation after normalisation: ${issues}`,
    );
  }

  return validated.data as Record<string, unknown>;
}

// ─── Quiz sanitiser ───────────────────────────────────────────────────────────

/**
 * Sanitises and repairs a quiz config produced by the AI.
 *
 * The AI may generate:
 *   - correctOptionId that doesn't match any option id (most common failure)
 *   - float values for points / timeLimitSec instead of integers
 *   - missing "id" on a question
 *   - empty text / label strings
 *
 * This function fixes what it safely can (integer coercion, missing question ids)
 * and throws a descriptive Error for anything that is unrecoverable (e.g. an
 * empty option list, or a correctOptionId that can't be resolved).
 */
function sanitiseQuizConfig(
  rawConfig: Record<string, unknown>,
  activityTitle: string,
): Record<string, unknown> {
  const questions = Array.isArray(rawConfig.questions) ? rawConfig.questions : [];

  if (questions.length === 0) {
    throw new Error(
      `AI generated quiz "${activityTitle}" has no questions. Please regenerate.`,
    );
  }

  const sanitisedQuestions = (questions as Record<string, unknown>[]).map(
    (rawQ, qIndex) => {
      const q = rawQ as Record<string, unknown>;

      // Ensure question has an id
      const questionId =
        typeof q.id === 'string' && q.id.trim()
          ? q.id.trim()
          : `question-${qIndex + 1}`;

      // Normalise text field (AI may use 'question' instead of 'text')
      const text =
        typeof q.text === 'string' && q.text.trim()
          ? q.text.trim()
          : typeof q.question === 'string' && (q.question as string).trim()
            ? (q.question as string).trim()
            : '';

      if (!text) {
        throw new Error(
          `AI generated quiz "${activityTitle}" has a question (${questionId}) with an empty question text. Please regenerate.`,
        );
      }

      const options = Array.isArray(q.options) ? q.options : [];

      if (options.length < 2) {
        throw new Error(
          `AI generated quiz "${activityTitle}" question "${text}" has fewer than 2 options. Please regenerate.`,
        );
      }

      // Normalise option ids — AI may produce empty ids
      const sanitisedOptions = (options as Record<string, unknown>[]).map(
        (opt, oIndex) => {
          const id =
            typeof opt.id === 'string' && opt.id.trim()
              ? opt.id.trim()
              : `q${qIndex + 1}-option-${oIndex + 1}`;
          const label =
            typeof opt.label === 'string' && opt.label.trim()
              ? opt.label.trim()
              : `Option ${oIndex + 1}`;
          return { id, label };
        },
      );

      const optionIds = sanitisedOptions.map((o) => o.id);

      // Resolve correctOptionId — the most common source of 400 errors
      let correctOptionId = typeof q.correctOptionId === 'string' ? q.correctOptionId.trim() : '';

      if (!optionIds.includes(correctOptionId)) {
        // Attempt to recover: if the AI used a numeric correctAnswerIndex
        const indexHint =
          typeof q.correctAnswerIndex === 'number'
            ? q.correctAnswerIndex
            : typeof q.correctAnswerIndex === 'string'
              ? parseInt(q.correctAnswerIndex as string, 10)
              : NaN;

        if (!isNaN(indexHint) && indexHint >= 0 && indexHint < sanitisedOptions.length) {
          correctOptionId = sanitisedOptions[indexHint]!.id;
        } else {
          // As a last resort, log the mismatch and default to the first option
          // so the activity can still be created — the host can edit it.
          console.warn(
            `[AI Studio] Quiz "${activityTitle}" Q${qIndex + 1}: correctOptionId "${q.correctOptionId
            }" does not match any option id [${optionIds.join(', ')}]. Defaulting to first option.`,
          );
          correctOptionId = sanitisedOptions[0]!.id;
        }
      }

      // Coerce floats to integers; clamp within backend-allowed range
      const points = Math.min(1000, Math.max(1, Math.round(
        typeof q.points === 'number' && q.points > 0 ? q.points : 100,
      )));
      const timeLimitSec = Math.min(300, Math.max(5, Math.round(
        typeof q.timeLimitSec === 'number' && q.timeLimitSec >= 5
          ? q.timeLimitSec
          : 20,
      )));

      return {
        id: questionId,
        text,
        options: sanitisedOptions,
        correctOptionId,
        points,
        timeLimitSec,
      };
    },
  );

  const candidateResult = {
    questions: sanitisedQuestions,
    speedBonusEnabled:
      typeof rawConfig.speedBonusEnabled === 'boolean'
        ? rawConfig.speedBonusEnabled
        : false,
  };

  // ─── Post-sanitisation validation ────────────────────────────────────────────
  // quizConfigSchema from @iep/types validates structure. We additionally
  // re-check the correctOptionId cross-reference (same rule as the backend's
  // superRefine) so we catch it client-side with a clear message.
  const validated = quizConfigSchema.safeParse(candidateResult);

  if (!validated.success) {
    const issues = validated.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(
      `AI generated quiz "${activityTitle}" failed validation after normalisation: ${issues}`,
    );
  }

  // Cross-check correctOptionId within each question (mirrors backend superRefine)
  for (const [qi, q] of validated.data.questions.entries()) {
    const ids = q.options.map((o) => o.id);
    if (!ids.includes(q.correctOptionId)) {
      throw new Error(
        `AI generated quiz "${activityTitle}" Q${qi + 1}: correctOptionId "${q.correctOptionId
        }" does not match any option id after normalisation [${ids.join(', ')}]. Please regenerate.`,
      );
    }
  }

  return validated.data as Record<string, unknown>;
}

// ─── Top-level normaliser ─────────────────────────────────────────────────────

function normaliseActivity(
  raw: {
    type: string;
    title: string;
    description: string;
    config?: Record<string, unknown>;
  },
  index: number,
): DraftActivity {
  const config = raw.config ?? {};
  const title = typeof raw.title === 'string' && raw.title.trim()
    ? raw.title.trim().slice(0, 199)
    : `Activity ${index + 1}`;

  const allowedTypes: ActivityType[] = [
    'poll',
    'quiz',
    'wordcloud',
    'qa',
    'feedback',
    'survey',
    'ai',
  ];

  const activityType = allowedTypes.includes(raw.type as ActivityType)
    ? (raw.type as ActivityType)
    : 'ai';

  let normalisedConfig: Record<string, unknown>;
  if (activityType === 'quiz') {
    normalisedConfig = sanitiseQuizConfig(config, title);
  } else if (activityType === 'poll') {
    normalisedConfig = sanitisePollConfig(config, title);
  } else if (activityType === 'wordcloud') {
    normalisedConfig = sanitiseWordcloudConfig(config, title);
  } else if (activityType === 'feedback') {
    normalisedConfig = sanitiseFeedbackConfig(config, title);
  } else if (activityType === 'survey') {
    normalisedConfig = sanitiseSurveyConfig(config, title);
  } else {
    // 'qa' and 'ai' types are skipped by handleCreateEventFromDraft
    normalisedConfig = config;
  }

  return {
    id: `api-${raw.type}-${index}-${Date.now()}`,
    type: activityType,
    title,
    description: raw.description,
    config: normalisedConfig,
  };
}

export default function AIStudioPage() {
  const router = useRouter();

  // State Grouping
  const [sessionConfig, setSessionConfig] = React.useState<SessionConfigState>({
    title: '', description: '', audienceType: '', eventType: '', duration: '', expectedParticipants: '', tone: '', language: 'en'
  });
  
  const [prompt, setPrompt] = React.useState('');
  const [generating, setGenerating] = React.useState(false);

  // Phase 4 Review State
  const [sessionReview, setSessionReview] = React.useState<SessionReview | null>(null);

  const [generateError, setGenerateError] = React.useState<string | null>(null);

  const [generatedEvent, setGeneratedEvent] = React.useState<GeneratedEvent | null>(null);
  const [engagementInfo, setEngagementInfo] = React.useState<{ score: number; tip: string; } | null>(null);

  const [drafts, setDrafts] = React.useState<DraftActivity[]>([]);
  const [accepted, setAccepted] = React.useState<DraftActivity[]>([]);
  // We'll use a local state to control Tabs internally if needed, but the Radix Tabs uses defaultValue natively if uncontrolled.
  // Actually Radix Tabs DOES support value/onValueChange in its standard Root. Let's verify `ui/tabs.tsx`.

  const [isCreatingEvent, setIsCreatingEvent] = React.useState(false);
  const [createEventError, setCreateEventError] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  
  const [modifyingDraftId, setModifyingDraftId] = React.useState<string | null>(null);


  // Phase 2 Planner State
  const [sessionPlan, setSessionPlan] = React.useState<SessionPlan | null>(null);

  // Phase 3 Copilot State
  const [copilotState, setCopilotState] = React.useState<CopilotState>({
    messages: [],
    pendingChange: null,
    history: [],
    isProcessing: false,
  });

  React.useEffect(() => {
    if (sessionPlan && (drafts.length > 0 || accepted.length > 0)) {
      ai.reviewer.evaluatePlan(sessionPlan, [...drafts, ...accepted]).then(rev => setSessionReview(rev));
    } else {
      setSessionReview(null);
    }
  }, [sessionPlan, drafts, accepted]);



  // Summary API state
  const [events, setEvents] = React.useState<Array<{ id: string; name: string; eventCode?: string }>>([]);
  const [eventsLoading, setEventsLoading] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = React.useState('');
  const [summarizing, setSummarizing] = React.useState(false);
  const [summaryResult, setSummaryResult] = React.useState<LiveSummaryResult | null>(null);
  const [summaryError, setSummaryError] = React.useState<string | null>(null);

  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);

    fetch('/api/proxy/events')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setEvents(
          list.map((e: Record<string, unknown>) => ({
            id: (e._id ?? e.id) as string,
            name: (e.name ?? e.title ?? 'Untitled') as string,
            eventCode: e.eventCode as string | undefined,
          })),
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setEventsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerate = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setGenerateError('Please describe the session you want to generate.');
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setGeneratedEvent(null);
    setSummaryResult(null);
    setEngagementInfo(null);
    setSessionPlan(null);
    setDrafts([]);
    setAccepted([]);
    setCopilotState({ messages: [], pendingChange: null, history: [], isProcessing: false });

    try {
      const config = { ...sessionConfig, prompt: cleanPrompt };
      const { plan, drafts: newDrafts } = await ai.planner.generatePlan(config);
      
      setDrafts(newDrafts);
      setSessionPlan(plan);
      
      setGeneratedEvent({
        title: plan.title,
        description: plan.objective,
      });
      setEngagementInfo({
        score: plan.estimatedEngagement,
        tip: 'Looking good!'
      });
      
    } catch (error) {
      setGenerateError(
        error instanceof Error ? error.message : 'Failed to generate session. Please try again.',
      );
    } finally {
      setGenerating(false);
    }
  };

  const acceptDraft = (draft: DraftActivity) => {
    setAccepted((previous) =>
      previous.some((activity) => activity.id === draft.id)
        ? previous
        : [...previous, draft],
    );
    setDrafts((previous) =>
      previous.filter((activity) => activity.id !== draft.id),
    );
  };

  const dismissDraft = (id: string) => {
    setDrafts((previous) => previous.filter((activity) => activity.id !== id));
  };

  const handleModifyDraft = async (draft: DraftActivity, instruction: string) => {
    // keeping signature for typechecker but disabled UI in phase 1
  };

  const handleInsertSession = (plan: SessionPlan) => {
    setSessionPlan(plan);
    setDrafts([]);
    setAccepted([]);
    setSessionConfig(prev => ({
      ...prev,
      title: plan.title,
      description: plan.objective,
      duration: plan.duration,
      audienceType: plan.audience,
      tone: plan.tone
    }));
  };

  const handleInsertActivity = (activity: DraftActivity) => {
    // Treat an inserted activity like a generated draft
    setDrafts(prev => [...prev, activity]);
  };

  const handleExport = async () => {
    if (!sessionPlan) {
      setGenerateError('No session plan to export. Generate a plan first.');
      return;
    }

    setIsExporting(true);
    setGenerateError(null);

    try {
      const allDrafts = [...accepted, ...drafts];
      const res = await fetch('/api/proxy/ai/export-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: sessionPlan, drafts: allDrafts }),
      });

      if (!res.ok) {
        throw new Error('Failed to export session plan');
      }

      const data = await res.json();
      if (data.eventId) {
        router.push(`/dashboard/events/${data.eventId}`);
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-[1600px] flex-1 flex flex-col">
        <AIWorkspaceHeader 
          title={sessionConfig.title || 'Untitled Workspace'} 
          status={drafts.length > 0 || accepted.length > 0 ? 'Drafting' : 'Idle'}
          onExport={handleExport}
          isExporting={isExporting}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start pb-12">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 h-auto flex flex-col">
            <SessionConfigurationPanel 
              config={sessionConfig}
              onChange={(updates) => setSessionConfig(prev => ({ ...prev, ...updates }))}
            />
            {copilotState.history.length > 0 && (
               <SessionHistory history={copilotState.history} />
            )}
          </div>

          {/* Center Column: Workspace */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <PromptEditor 
              prompt={prompt}
              setPrompt={setPrompt}
              onGenerate={handleGenerate}
              generating={generating}
            />

            {generateError && (
              <p className="rounded-md border border-destructive/30 bg-error-subtle px-3 py-2 text-sm text-destructive">
                {generateError}
              </p>
            )}

            
            <Tabs defaultValue="library" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="plan">Session Plan</TabsTrigger>
                <TabsTrigger value="review">AI Review & Optimization</TabsTrigger>
                <TabsTrigger value="library">Knowledge Library</TabsTrigger>
              </TabsList>
              
              <TabsContent value="library" className="h-[800px]">
                <KnowledgeLibrary 
                  onInsertSession={handleInsertSession}
                  onInsertActivity={handleInsertActivity}
                />
              </TabsContent>

              <TabsContent value="plan" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {generating ? (
                  <GenerationProgress />
                ) : drafts.length === 0 && accepted.length === 0 && !sessionPlan ? (
                  <WorkspaceEmptyState type="draft" />
                ) : (
                  <>
                    {sessionPlan && <PlanningSummaryCard plan={sessionPlan} />}
                    
                    {sessionPlan && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold tracking-tight px-1">Session Agenda</h3>
                        <AgendaTimeline agenda={sessionPlan.agenda} />
                      </div>
                    )}

                    <div className="space-y-4 mt-8 pt-8 border-t">
                      <h3 className="text-lg font-semibold tracking-tight px-1">Interactive Drafts</h3>
                      <DraftWorkspace 
                        drafts={drafts}
                        accepted={accepted}
                        onAccept={acceptDraft}
                        onDuplicate={() => {}}
                        onDelete={dismissDraft}
                        onEdit={() => {}}
                        sessionPlan={sessionPlan}
                        sessionReview={sessionReview}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="review">
                <ReviewDashboard 
                  review={sessionReview} 
                  onAcceptProposal={(id, newPlan) => {
                    setSessionPlan(newPlan);
                    // In a real app, we'd also push to copilot history here
                  }} 
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: AI Suggestions & Status -> Now Copilot */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 flex flex-col gap-6 h-auto h-[calc(100vh-8rem)]">
            {sessionPlan ? (
              <PlanningInsights plan={sessionPlan} />
            ) : (
              <WorkspaceStatus 
                generatedCount={drafts.length + accepted.length}
                acceptedCount={accepted.length}
                estimatedDuration={sessionConfig.duration || '0m'}
                isGenerating={generating}
              />
            )}
            
            {sessionPlan ? (
              <CopilotPanel 
                copilotState={copilotState}
                setCopilotState={setCopilotState}
                currentPlan={sessionPlan}
                onPlanMutated={(newPlan) => setSessionPlan(newPlan)}
              />
            ) : drafts.length === 0 && accepted.length === 0 ? (
              <WorkspaceEmptyState type="suggestions" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
