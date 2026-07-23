'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFeatureFlags } from '@/lib/use-feature-flags';

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
  VideoCallout,
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
import { getVideoByFeature } from '@/lib/tutorial-videos';

type DraftActivity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  config?: Record<string, unknown>;
};

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
  const { flags, loading } = useFeatureFlags();

  React.useEffect(() => {
    if (!loading && !flags['ai-studio']) {
      router.replace('/dashboard');
    }
  }, [flags, loading, router]);

  const [prompt, setPrompt] = React.useState('');
  const [generating, setGenerating] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);

  const [generatedEvent, setGeneratedEvent] =
    React.useState<GeneratedEvent | null>(null);

  const [engagementInfo, setEngagementInfo] = React.useState<{
    score: number;
    tip: string;
  } | null>(null);

  const [drafts, setDrafts] = React.useState<DraftActivity[]>([]);
  const [accepted, setAccepted] = React.useState<DraftActivity[]>([]);

  const [isCreatingEvent, setIsCreatingEvent] = React.useState(false);
  const [createEventError, setCreateEventError] = React.useState<string | null>(
    null,
  );

  const [modifyingDraftId, setModifyingDraftId] = React.useState<string | null>(null);

  const [events, setEvents] = React.useState<
    Array<{ id: string; name: string; eventCode?: string }>
  >([]);
  const [eventsLoading, setEventsLoading] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = React.useState('');
  const [summarizing, setSummarizing] = React.useState(false);
  const [summaryResult, setSummaryResult] =
    React.useState<LiveSummaryResult | null>(null);
  const [summaryError, setSummaryError] = React.useState<string | null>(null);

  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  // Fetch host's own events via the authenticated proxy.
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
      .catch(() => {
        /* silently ignore - selector just stays empty */
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerate = async () => {
    if (!flags['ai-studio']) return;

    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setGenerateError('Please describe the session you want to generate.');
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setCreateEventError(null);
    setDrafts([]);
    setAccepted([]);
    setGeneratedEvent(null);
    setSummaryResult(null);
    setEngagementInfo(null);

    try {
      // Use the Next.js proxy so the Auth0 Bearer token is forwarded automatically.
      const res = await fetch('/api/proxy/ai/generate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleanPrompt }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let message = `Failed to generate session. Server returned ${res.status}.`;

        try {
          const parsed = JSON.parse(text) as {
            message?: string | string[];
            error?: string;
            statusCode?: number;
          };

          const parsedMessage = Array.isArray(parsed?.message)
            ? parsed.message.join(', ')
            : parsed?.message;

          if (parsedMessage) {
            message = parsedMessage;
          } else if (parsed?.error) {
            message = parsed.error;
          }

          if (
            res.status === 503 ||
            String(message).toLowerCase().includes('temporarily busy') ||
            String(message).toLowerCase().includes('high demand')
          ) {
            message =
              'The AI service is temporarily busy. Please wait a moment and try again.';
          }
        } catch {
          if (text) message = text;
        }

        throw new Error(message);
      }

      const data = (await res.json()) as {
        event?: { title?: string; description?: string };
        engagement?: { score: number; tip: string };
        activities?: {
          type: string;
          title: string;
          description: string;
          config?: Record<string, unknown>;
        }[];
      };

      const activities = Array.isArray(data.activities) ? data.activities : [];

      if (activities.length === 0) {
        throw new Error('AI did not return any activities. Please try again.');
      }

      setGeneratedEvent({
        title: data.event?.title ?? cleanPrompt,
        description:
          data.event?.description ??
          'An event generated using Pulse AI Studio.',
      });

      if (data.engagement) {
        setEngagementInfo({
          score: Number(data.engagement.score) || 85,
          tip: data.engagement.tip || 'Looking good!',
        });
      }

      setDrafts(
        activities.map((activity, index) =>
          normaliseActivity(activity, index),
        ),
      );
    } catch (error) {
      console.error('AI session generation failed:', error);
      setGenerateError(
        error instanceof Error
          ? error.message
          : 'Failed to generate session. Please try again.',
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
    setModifyingDraftId(draft.id);
    setGenerateError(null);
    try {
      const res = await fetch('/api/proxy/ai/modify-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity: draft, instruction }),
      });

      if (!res.ok) {
        throw new Error('Failed to modify draft.');
      }

      const updatedConfig = await res.json();

      const updatedDraft = normaliseActivity({
        ...draft,
        config: updatedConfig
      }, drafts.findIndex(d => d.id === draft.id));

      updatedDraft.id = draft.id; // Preserve original ID

      setDrafts(current => current.map(d => d.id === draft.id ? updatedDraft : d));
    } catch (error) {
      console.error('Modify draft failed:', error);
      setGenerateError(
        error instanceof Error ? error.message : 'Failed to modify draft.'
      );
    } finally {
      setModifyingDraftId(null);
    }
  };

  const handleCreateEventFromDraft = async () => {
    if (accepted.length === 0) {
      setCreateEventError(
        'Accept at least one activity before creating the event.',
      );
      return;
    }

    try {
      setIsCreatingEvent(true);
      setCreateEventError(null);

      const authHeaders = { 'Content-Type': 'application/json' };

      // Step 1: Create the event.
      const eventResponse = await fetch('/api/proxy/events', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: generatedEvent?.title ?? 'AI Generated Session',
          description:
            generatedEvent?.description ??
            'An event generated using Pulse AI Studio.',
          settings: {
            allowAnonymousQA: true,
            requireModeration: false,
            participantNames: false,
          },
        }),
      });

      if (!eventResponse.ok) {
        const errorData = (await eventResponse.json().catch(() => null)) as {
          message?: string | string[];
        } | null;
        throw new Error(
          Array.isArray(errorData?.message)
            ? errorData.message.join(', ')
            : errorData?.message || 'Failed to create event.',
        );
      }

      const event = (await eventResponse.json()) as {
        _id?: string;
        id?: string;
        eventCode?: string;
      };

      const eventId = event._id ?? event.id;
      const eventCode = event.eventCode;

      if (!eventId) {
        throw new Error('Event was created but no event ID was returned.');
      }

      if (!eventCode) {
        throw new Error('Event was created but no event code was returned.');
      }

      // Step 2: Create all accepted activities.
      for (const activity of accepted) {
        if (
          activity.type !== 'poll' &&
          activity.type !== 'quiz' &&
          activity.type !== 'wordcloud' &&
          activity.type !== 'feedback' &&
          activity.type !== 'survey'
        ) {
          continue;
        }

        const activityResponse = await fetch(
          `/api/proxy/events/${eventId}/activities`,
          {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              type: activity.type,
              title: activity.title,
              config: activity.config ?? {},
            }),
          },
        );

        if (!activityResponse.ok) {
          const errorData = (await activityResponse
            .json()
            .catch(() => null)) as { message?: string | string[] } | null;
          console.error('AI activity creation failed:', {
            activity,
            status: activityResponse.status,
            errorData,
          });
          const details = Array.isArray(errorData?.message)
            ? errorData.message.join(', ')
            : errorData?.message;
          throw new Error(
            `Could not create "${activity.title}" (${activity.type}). ${details || `Server returned ${activityResponse.status}`
            }`,
          );
        }
      }

      router.push(`/dashboard/events/${eventId}`);
    } catch (error) {
      console.error('Failed to create event from AI draft:', error);
      setCreateEventError(
        error instanceof Error
          ? error.message
          : 'Failed to create event from AI draft.',
      );
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleSummarize = async () => {
    if (!selectedEventId) {
      setSummaryError('Please select an event first.');
      return;
    }

    setSummarizing(true);
    setSummaryError(null);
    setSummaryResult(null);

    try {
      const res = await fetch(
        `/api/proxy/ai/events/${selectedEventId}/summarize-live-answers`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      );

      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        const status = res.status;
        throw new Error(
          status === 403
            ? 'You do not own this event.'
            : status === 401
              ? 'Session expired - please log in again.'
              : errorData?.message ?? `Server returned ${status}.`,
        );
      }

      const result = (await res.json()) as LiveSummaryResult;
      setSummaryResult(result);
    } catch (error) {
      setSummaryError(
        error instanceof Error
          ? error.message
          : 'Failed to generate summary. Please try again.',
      );
    } finally {
      setSummarizing(false);
    }
  };

  const summaryThemes: SummaryTheme[] =
    summaryResult?.hasResponses
      ? summaryResult.themes.map((t) => ({ label: t.label, count: t.count }))
      : [];

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  if (loading || !flags['ai-studio']) {
    return null;
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="AI workspace"
        title="AI Studio"
        badge={<AIBadge label="Beta" size="sm" />}
        description="Draft sessions, review suggested activities, and summarize live audience responses from one focused workspace."
      />

      {/* Tutorial callout — subtle, does not interfere with the AI workflow */}
      {(() => {
        const video = getVideoByFeature('ai-studio');
        return video ? (
          <VideoCallout
            video={video}
            label="New to AI Studio? Watch a quick walkthrough"
            tone="ai"
          />
        ) : null;
      })()}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <SurfacePanel tone="ai" className="space-y-5 p-4 sm:p-5">
          <SectionHeader
            eyebrow="Prompt area"
            title="Describe the session you want"
            description="Pulse keeps the workflow editable: generate suggestions, accept the useful ones, then create the event when the draft is ready."
          />

          <div className="mb-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Inspiration Gallery</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
              {SESSION_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.title}
                  type="button"
                  onClick={() => setPrompt(tpl.prompt)}
                  className={`group relative flex w-60 shrink-0 flex-col items-start gap-1 overflow-hidden rounded-xl border bg-gradient-to-br p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg ${tpl.gradient}`}
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="font-semibold text-foreground">{tpl.title}</span>
                  <span className="text-xs text-ink-muted">{tpl.description}</span>
                </button>
              ))}
            </div>
          </div>

          <AIComposer
            value={prompt}
            onChange={setPrompt}
            onGenerate={handleGenerate}
            loading={generating}
            suggestions={[]}
            placeholder="Describe your session - Pulse drafts the activities..."
            className="bg-surface-card"
          />

          {generating && (
            <div className="space-y-4 rounded-xl border border-ai-border bg-surface-card p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-ai-subtle-text">
                <Sparkles className="h-4 w-4 animate-spin text-ai" />
                Drafting activities for your session...
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <ActivityTileSkeleton key={index} />
                ))}
              </div>
            </div>
          )}

          {generateError && (
            <p className="rounded-md border border-destructive/30 bg-error-subtle px-3 py-2 text-sm text-destructive">
              {generateError}
            </p>
          )}

          {drafts.length > 0 && (
            <div className="space-y-3 rounded-md border border-ai-border bg-surface-card p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-ai" />
                <span className="text-sm font-semibold text-ai-subtle-text">
                  Suggested activities
                </span>
              </div>

              {engagementInfo && (
                <div className="mb-2 mt-2 flex flex-col gap-2 rounded-lg border border-ai/20 bg-ai/5 p-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-ai/10 to-transparent pointer-events-none" />
                  <div className="relative flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-ai">Engagement Predictor</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold shadow-sm",
                      engagementInfo.score >= 80 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {engagementInfo.score} Score
                    </span>
                  </div>
                  <p className="relative text-sm text-ink-secondary leading-relaxed"><strong className="text-foreground">Tip:</strong> {engagementInfo.tip}</p>
                </div>
              )}

              <div className="grid gap-2">
                {drafts.map((draft) => (
                  <SuggestionChip
                    key={draft.id}
                    className="rounded-lg"
                    activityDetails={{ type: draft.type, config: draft.config }}
                    text={
                      <span>
                        <span className="font-semibold">{draft.title}</span>
                        <span className="text-ink-muted">
                          {' '}
                          - {draft.description}
                        </span>
                      </span>
                    }
                    onAccept={() => acceptDraft(draft)}
                    onDismiss={() => dismissDraft(draft.id)}
                    onTweak={
                      modifyingDraftId === draft.id
                        ? undefined
                        : (instruction) => handleModifyDraft(draft, instruction)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </SurfacePanel>

        <div className="space-y-4">
          <SurfacePanel className="space-y-3 border border-white/10 bg-surface-panel/60 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-ai-subtle text-ai">
                <WandSparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Workspace status
                </p>
                <p className="text-xs text-ink-muted">
                  {accepted.length} accepted / {drafts.length} suggested
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border border-border/50 bg-surface-sunken/50 p-3 backdrop-blur-sm">
                <p className="font-mono text-lg font-semibold text-foreground">
                  {drafts.length}
                </p>
                <p className="text-xs text-ink-muted">Open suggestions</p>
              </div>
              <div className="rounded-md border border-border/50 bg-surface-sunken/50 p-3 backdrop-blur-sm">
                <p className="font-mono text-lg font-semibold text-foreground">
                  {accepted.length}
                </p>
                <p className="text-xs text-ink-muted">In draft</p>
              </div>
            </div>
          </SurfacePanel>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {FEATURE_CARDS.map((feature) => (
              <Card key={feature.title} className="border-white/10 bg-surface-card/60 shadow-xs backdrop-blur-xl transition-all hover:bg-surface-card/80">
                <CardHeader className="flex-row items-start gap-3 space-y-0 p-4">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ai-subtle text-ai">
                    {feature.icon}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-sm leading-tight">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Generated output"
          description="Activities you have accepted. Add them to an event to run them live."
          actions={
            accepted.length > 0 ? (
              <Button
                type="button"
                variant="ai"
                onClick={handleCreateEventFromDraft}
                loading={isCreatingEvent}
              >
                {!isCreatingEvent && <Sparkles className="h-4 w-4" />}
                {isCreatingEvent ? 'Creating event...' : 'Create event from draft'}
              </Button>
            ) : undefined
          }
        />

        {createEventError && (
          <p className="rounded-md border border-destructive/30 bg-error-subtle px-3 py-2 text-sm text-destructive">
            {createEventError}
          </p>
        )}

        {accepted.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-ai-border/50 bg-surface-card/30 p-12 text-center backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] grayscale">
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 w-48 rounded-xl bg-foreground" />
                ))}
              </div>
            </div>
            <div className="relative z-10 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ai-subtle text-ai shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">Waiting for inspiration...</h3>
              <p className="max-w-sm text-sm text-ink-muted">
                Generate a session using the AI composer above. We&apos;ll draft some activities here for you to review and keep.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {generatedEvent && (
              <SurfacePanel className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-ai">
                  Event draft
                </p>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {generatedEvent.title}
                </h3>
                <p className="text-sm text-ink-secondary">
                  {generatedEvent.description}
                </p>
              </SurfacePanel>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {accepted.map((draft) => (
                <ActivityTile
                  key={draft.id}
                  type={draft.type}
                  icon={ICON_BY_TYPE[draft.type]}
                  title={draft.title}
                  description={draft.description}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="AI summary and insights"
          description="Pulse distills open responses and Q&A into a short readout you can read aloud."
          actions={
            <ActionGroup className="w-full sm:w-auto" align="end">
              <Select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setSummaryResult(null);
                  setSummaryError(null);
                }}
                disabled={eventsLoading || summarizing}
                wrapperClassName="w-full sm:w-64"
              >
                <option value="">
                  {eventsLoading
                    ? 'Loading events...'
                    : events.length === 0
                      ? 'No events yet'
                      : 'Select an event'}
                </option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                    {event.eventCode ? ` - ${event.eventCode}` : ''}
                  </option>
                ))}
              </Select>

              <Button
                type="button"
                variant="ai"
                onClick={handleSummarize}
                disabled={!selectedEventId}
                loading={summarizing}
              >
                {!summarizing && <Sparkles className="h-4 w-4" />}
                {summarizing ? 'Analyzing responses...' : 'Summarize answers'}
              </Button>
            </ActionGroup>
          }
        />

        {summaryError && (
          <p className="rounded-md border border-destructive/30 bg-error-subtle px-3 py-2 text-sm text-destructive">
            {summaryError}
          </p>
        )}

        {summaryResult !== null ? (
          summaryResult.hasResponses ? (
            <AISummaryCard
              title="What your audience is saying"
              body={summarizing ? undefined : summaryResult.summary}
              themes={summarizing ? [] : summaryThemes}
              shimmer={summarizing}
              footnote={
                summarizing
                  ? undefined
                  : `Summarized from ${summaryResult.responseCount} real response${summaryResult.responseCount === 1 ? '' : 's'}${selectedEvent ? ` - ${selectedEvent.name}` : ''}`
              }
              exportConfig={
                summarizing
                  ? undefined
                  : {
                    summary: summaryResult.summary,
                    themes: summaryThemes,
                    footnote: `Summarized from ${summaryResult.responseCount} real response${summaryResult.responseCount === 1 ? '' : 's'}${selectedEvent ? ` - ${selectedEvent.name}` : ''}`,
                    eventName: selectedEvent?.name,
                  }
              }
            />
          ) : (
            <EmptyState
              icon={<MessageSquareText className="h-6 w-6" />}
              title="No audience responses yet"
              description={summaryResult.message}
            />
          )
        ) : summarizing ? (
          <AISummaryCard
            title="What your audience is saying"
            body={undefined}
            themes={[]}
            shimmer={true}
            footnote={undefined}
          />
        ) : (
          <EmptyState
            tone="ai"
            icon={<Lightbulb className="h-6 w-6" />}
            title="No answers summarized yet"
            description="Run a summary to see the top themes from your audience."
          />
        )}
      </section>
    </div>
  );
}
