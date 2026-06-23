'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import {
  Sparkles,
  BarChart3,
  ListChecks,
  Cloud,
  HelpCircle,
  Star,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Eyebrow,
  AIBadge,
  AIComposer,
  AISummaryCard,
  SuggestionChip,
  ActivityTile,
  type ActivityType,
  type SummaryTheme,
} from '@/components/pulse';

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

const API_URL = 'http://localhost:4000';

const ICON_BY_TYPE: Record<ActivityType, React.ReactNode> = {
  poll: <BarChart3 className="h-5 w-5" />,
  quiz: <ListChecks className="h-5 w-5" />,
  wordcloud: <Cloud className="h-5 w-5" />,
  qa: <HelpCircle className="h-5 w-5" />,
  feedback: <Star className="h-5 w-5" />,
  ai: <Sparkles className="h-5 w-5" />,
};

const SUGGESTIONS = [
  'A 30-minute product kickoff for 80 people',
  'An icebreaker plus a 5-question trivia round',
  'A retro that gathers wins, blockers, and a mood rating',
];

const SUMMARY_THEMES: SummaryTheme[] = [
  { label: 'Clearer roadmap and priorities', count: 38 },
  { label: 'More time for live Q&A', count: 24 },
  { label: 'Loved the trivia round', count: 19 },
];

function normaliseActivity(
  raw: {
    type: string;
    title: string;
    description: string;
    config?: Record<string, unknown>;
  },
  index: number,
): DraftActivity {
  let config = raw.config ?? {};

  // Backend AI may return quiz question as "question".
  // The app activity schema requires it as "text".
  if (raw.type === 'quiz' && Array.isArray(config.questions)) {
    config = {
      ...config,
      questions: (config.questions as Record<string, unknown>[]).map((q) => {
        const { question, ...rest } = q as {
          question?: string;
        } & Record<string, unknown>;

        return {
          ...rest,
          text: rest.text ?? question ?? '',
        };
      }),
    };
  }

  const allowedTypes: ActivityType[] = [
    'poll',
    'quiz',
    'wordcloud',
    'qa',
    'feedback',
    'ai',
  ];

  const activityType = allowedTypes.includes(raw.type as ActivityType)
    ? (raw.type as ActivityType)
    : 'ai';

  return {
    id: `api-${raw.type}-${index}-${Date.now()}`,
    type: activityType,
    title: raw.title,
    description: raw.description,
    config,
  };
}

export default function AIStudioPage() {
  const router = useRouter();

  const [prompt, setPrompt] = React.useState('');
  const [generating, setGenerating] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(
    null,
  );

  const [generatedEvent, setGeneratedEvent] =
    React.useState<GeneratedEvent | null>(null);

  const [drafts, setDrafts] = React.useState<DraftActivity[]>([]);
  const [accepted, setAccepted] = React.useState<DraftActivity[]>([]);

  const [isCreatingEvent, setIsCreatingEvent] = React.useState(false);
  const [createEventError, setCreateEventError] = React.useState<
    string | null
  >(null);

  const [summarizing, setSummarizing] = React.useState(false);
  const [showSummary, setShowSummary] = React.useState(false);

  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const pending = timers.current;

    return () => {
      pending.forEach(clearTimeout);
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
    setCreateEventError(null);
    setDrafts([]);
    setAccepted([]);
    setGeneratedEvent(null);
    setShowSummary(false);

    try {
      const res = await fetch(`${API_URL}/ai/generate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: cleanPrompt }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          text || `Failed to generate session. Server returned ${res.status}.`,
        );
      }

      const data = (await res.json()) as {
        event?: { title?: string; description?: string };
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
    setDrafts((previous) =>
      previous.filter((activity) => activity.id !== id),
    );
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

      const authHeaders = {
        'Content-Type': 'application/json',
      };

      // Step 1: Create event
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
        const errorData = await eventResponse.json().catch(() => null);

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

      // Step 2: Create all accepted activities
      for (const activity of accepted) {
        if (
          activity.type !== 'poll' &&
          activity.type !== 'quiz' &&
          activity.type !== 'wordcloud' &&
          activity.type !== 'feedback'
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
          const errorData = await activityResponse.json().catch(() => null);

          throw new Error(
            Array.isArray(errorData?.message)
              ? errorData.message.join(', ')
              : errorData?.message ||
                  `Failed to create "${activity.title}" activity.`,
          );
        }
      }

      // Step 3: Correct route based on app/event/[code]/page.tsx
      router.push(`/event/${eventCode}`);
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

  const handleSummarize = () => {
    setSummarizing(true);
    setShowSummary(true);

    timers.current.push(
      setTimeout(() => {
        setSummarizing(false);
      }, 1600),
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eyebrow>AI Studio</Eyebrow>
          <AIBadge label="Beta" size="sm" />
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Draft a session in seconds
        </h1>

        <p className="max-w-2xl text-sm text-ink-secondary">
          Describe what you want to run and Pulse drafts the activities for you.
          Accept the ones you like, then create a live event directly from your
          AI-generated session.
        </p>
      </div>

      <Card className="border-ai-border">
        <CardContent className="space-y-5 pt-6">
          <AIComposer
            value={prompt}
            onChange={setPrompt}
            onGenerate={handleGenerate}
            loading={generating}
            suggestions={SUGGESTIONS}
            placeholder="Describe your session — Pulse drafts the activities…"
          />

          {generating && (
            <div className="flex items-center gap-2 text-sm text-ai-subtle-text">
              <Sparkles className="h-4 w-4 animate-spin text-ai" />
              Drafting activities for your session…
            </div>
          )}

          {generateError && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <span aria-hidden="true">⚠</span>
              {generateError}
            </p>
          )}

          {drafts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-ai" />
                <span className="text-sm font-semibold text-ai-subtle-text">
                  Suggested activities
                </span>
              </div>

              <div className="space-y-2">
                {drafts.map((draft) => (
                  <SuggestionChip
                    key={draft.id}
                    text={
                      <span>
                        <span className="font-semibold">{draft.title}</span>
                        <span className="text-ink-muted">
                          {' '}
                          · {draft.description}
                        </span>
                      </span>
                    }
                    onAccept={() => acceptDraft(draft)}
                    onDismiss={() => dismissDraft(draft.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Your drafted session
            </h2>

            <p className="text-sm text-ink-secondary">
              Activities you have accepted. Add these to an event to run them
              live.
            </p>
          </div>

          {accepted.length > 0 && (
            <button
              type="button"
              onClick={handleCreateEventFromDraft}
              disabled={isCreatingEvent}
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-ai px-[1.125rem] text-sm font-semibold text-white transition-colors hover:bg-ai-hover disabled:cursor-not-allowed disabled:bg-ai-border"
            >
              <Sparkles
                className={
                  isCreatingEvent
                    ? 'h-[15px] w-[15px] animate-spin'
                    : 'h-[15px] w-[15px]'
                }
              />
              {isCreatingEvent
                ? 'Creating event…'
                : 'Create event from draft'}
            </button>
          )}
        </div>

        {createEventError && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <span aria-hidden="true">⚠</span>
            {createEventError}
          </p>
        )}

        {accepted.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ai-subtle text-ai">
                <Sparkles className="h-6 w-6" />
              </span>

              <div className="space-y-1">
                <p className="font-display text-lg font-semibold text-foreground">
                  Nothing drafted yet
                </p>

                <p className="max-w-sm text-sm text-ink-secondary">
                  Generate a session above, then accept the suggestions you want
                  to keep.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
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
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Live answer summary
            </h2>

            <p className="text-sm text-ink-secondary">
              Pulse distills open responses and Q&amp;A into a short readout you
              can read aloud.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSummarize}
            disabled={summarizing}
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-ai px-[1.125rem] text-sm font-semibold text-white transition-colors hover:bg-ai-hover disabled:cursor-not-allowed disabled:bg-ai-border"
          >
            <Sparkles
              className={
                summarizing
                  ? 'h-[15px] w-[15px] animate-spin'
                  : 'h-[15px] w-[15px]'
              }
            />
            {summarizing ? 'Summarizing…' : 'Summarize answers'}
          </button>
        </div>

        {showSummary ? (
          <AISummaryCard
            title="What your audience is saying"
            body={
              summarizing
                ? undefined
                : 'Most of your audience left energized and want a clearer view of what comes next. The trivia round landed well, and several people asked for more live Q&A time.'
            }
            themes={summarizing ? [] : SUMMARY_THEMES}
            shimmer={summarizing}
            footnote={
              summarizing
                ? undefined
                : 'Summarized from 142 responses · demo data'
            }
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                No answers summarized yet
              </CardTitle>
              <CardDescription>
                Run a summary to see the top themes from your audience.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </div>
  );
}