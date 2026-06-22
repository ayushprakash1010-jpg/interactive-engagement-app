'use client';

import * as React from 'react';
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
};

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

// Demo-only drafted session — no real model call. Generated locally.
const DRAFTED_ACTIVITIES: DraftActivity[] = [
  {
    id: 'draft-poll',
    type: 'poll',
    title: 'Warm-up poll',
    description: 'How are you joining us today? — in person, remote, or hybrid.',
  },
  {
    id: 'draft-wordcloud',
    type: 'wordcloud',
    title: 'One-word check-in',
    description: 'Ask your audience for a single word that captures their mood.',
  },
  {
    id: 'draft-quiz',
    type: 'quiz',
    title: 'Five-question trivia',
    description: 'A timed round with a live leaderboard to keep the energy up.',
  },
  {
    id: 'draft-feedback',
    type: 'feedback',
    title: 'Closing feedback',
    description: 'A rating plus an open comment to wrap the session.',
  },
];

const SUMMARY_THEMES: SummaryTheme[] = [
  { label: 'Clearer roadmap and priorities', count: 38 },
  { label: 'More time for live Q&A', count: 24 },
  { label: 'Loved the trivia round', count: 19 },
];

export default function AIStudioPage() {
  const [prompt, setPrompt] = React.useState('');
  const [generating, setGenerating] = React.useState(false);
  const [drafts, setDrafts] = React.useState<DraftActivity[]>([]);
  const [accepted, setAccepted] = React.useState<DraftActivity[]>([]);
  const [summarizing, setSummarizing] = React.useState(false);
  const [showSummary, setShowSummary] = React.useState(false);

  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  React.useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setDrafts([]);
    setShowSummary(false);
    timers.current.push(
      setTimeout(() => {
        setDrafts(DRAFTED_ACTIVITIES);
        setGenerating(false);
      }, 1400),
    );
  };

  const acceptDraft = (draft: DraftActivity) => {
    setAccepted((prev) =>
      prev.some((d) => d.id === draft.id) ? prev : [...prev, draft],
    );
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
  };

  const dismissDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSummarize = () => {
    setSummarizing(true);
    setShowSummary(true);
    timers.current.push(
      setTimeout(() => setSummarizing(false), 1600),
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
          Accept the ones you like, then summarize the live answers when your
          audience responds.
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
                        <span className="text-ink-muted"> · {draft.description}</span>
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
        <div className="space-y-1">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Your drafted session
          </h2>
          <p className="text-sm text-ink-secondary">
            Activities you have accepted. Add these to an event to run them live.
          </p>
        </div>

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
            <Sparkles className={summarizing ? 'h-[15px] w-[15px] animate-spin' : 'h-[15px] w-[15px]'} />
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
            footnote={summarizing ? undefined : 'Summarized from 142 responses · demo data'}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No answers summarized yet</CardTitle>
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
