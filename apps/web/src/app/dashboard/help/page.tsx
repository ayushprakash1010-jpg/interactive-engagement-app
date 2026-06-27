'use client';

import * as React from 'react';
import {
  BarChart3,
  BookOpen,
  Bug,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Command,
  FileDown,
  HelpCircle,
  Keyboard,
  LifeBuoy,
  Lightbulb,
  ListChecks,
  MessageSquare,
  MousePointer2,
  PanelLeft,
  Rocket,
  Search,
  Send,
  Settings,
  ShieldQuestion,
  Sparkles,
  Star,
  Trophy,
  WandSparkles,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  PageHeader,
  SectionHeader,
  SurfacePanel,
} from '@/components/ui';

type GuideItem = {
  title: string;
  description: string;
  icon: React.ElementType;
  tags: string[];
};

type FeatureGuide = {
  title: string;
  description: string;
  icon: React.ElementType;
  items: string[];
  tags: string[];
};

const HELP_SECTIONS = [
  { id: 'getting-started', label: 'Getting Started', icon: Rocket },
  { id: 'feature-guides', label: 'Feature Guides', icon: BookOpen },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'support', label: 'Contact & Support', icon: LifeBuoy },
  { id: 'whats-new', label: "What's New", icon: Star },
  { id: 'product-info', label: 'Product Information', icon: Settings },
] as const;

const gettingStarted: GuideItem[] = [
  {
    title: 'Create your first event',
    description:
      'From Events, create a session, add a title, and configure participant settings before inviting your audience.',
    icon: Rocket,
    tags: ['event', 'create', 'start'],
  },
  {
    title: 'Launch a poll',
    description:
      'Add a poll activity, review options, then launch it live so participants can respond from their devices.',
    icon: BarChart3,
    tags: ['poll', 'launch'],
  },
  {
    title: 'Launch a quiz',
    description:
      'Build quiz questions, set answers, run the quiz, and use the leaderboard to keep the room engaged.',
    icon: ListChecks,
    tags: ['quiz', 'leaderboard'],
  },
  {
    title: 'Use Word Cloud',
    description:
      'Collect short audience responses and show the strongest themes visually during the session.',
    icon: Cloud,
    tags: ['word cloud', 'responses'],
  },
  {
    title: 'Run Feedback',
    description:
      'Gather ratings and comments after a session or activity to understand sentiment and follow-up needs.',
    icon: MessageSquare,
    tags: ['feedback', 'ratings'],
  },
  {
    title: 'Moderate Q&A',
    description:
      'Review submitted questions, keep the useful ones visible, and mark answered questions as the session moves.',
    icon: ShieldQuestion,
    tags: ['qa', 'moderation'],
  },
  {
    title: 'Export analytics',
    description:
      'Open event analytics to review participation, response trends, and export-ready reporting views.',
    icon: FileDown,
    tags: ['analytics', 'export'],
  },
  {
    title: 'Use AI Studio',
    description:
      'Describe a session, review suggested activities, and accept the ideas you want before creating the event.',
    icon: Sparkles,
    tags: ['ai', 'studio'],
  },
];

const featureGuides: FeatureGuide[] = [
  {
    title: 'Polls',
    description: 'Fast audience checks for decisions, sentiment, and alignment.',
    icon: BarChart3,
    items: ['Create', 'Launch', 'Close', 'Analytics'],
    tags: ['poll', 'create', 'launch', 'close', 'analytics'],
  },
  {
    title: 'Quiz',
    description: 'Structured knowledge checks with scoring and live momentum.',
    icon: Trophy,
    items: ['Create', 'Timer', 'Leaderboard', 'Analytics'],
    tags: ['quiz', 'timer', 'leaderboard', 'analytics'],
  },
  {
    title: 'Word Cloud',
    description: 'A visual way to surface repeated ideas and shared language.',
    icon: Cloud,
    items: ['Live responses', 'Duplicate words', 'Analytics'],
    tags: ['word cloud', 'live responses', 'duplicate words', 'analytics'],
  },
  {
    title: 'Feedback',
    description: 'Collect ratings, comments, and reports after important moments.',
    icon: MessageSquare,
    items: ['Ratings', 'Comments', 'Reports'],
    tags: ['feedback', 'ratings', 'comments', 'reports'],
  },
  {
    title: 'Q&A',
    description: 'Capture audience questions and keep discussion focused.',
    icon: ShieldQuestion,
    items: ['Anonymous mode', 'Moderation', 'AI Reply', 'Mark answered'],
    tags: ['qa', 'anonymous', 'moderation', 'ai reply', 'answered'],
  },
  {
    title: 'AI Studio',
    description: 'Draft activities and summarize live answers with AI assistance.',
    icon: WandSparkles,
    items: [
      'Generate Poll',
      'Generate Quiz',
      'Generate Feedback',
      'AI Summary',
      'AI Insights',
    ],
    tags: ['ai studio', 'generate', 'summary', 'insights'],
  },
  {
    title: 'Analytics',
    description: 'Review engagement, exports, and AI-assisted takeaways.',
    icon: BarChart3,
    items: ['Reports', 'CSV Export', 'PDF Export', 'AI Insights'],
    tags: ['analytics', 'reports', 'csv', 'pdf', 'ai insights'],
  },
  {
    title: 'Landing Page',
    description: 'Guide participants into sessions quickly from any device.',
    icon: MousePointer2,
    items: ['Creating events', 'Joining sessions', 'Sharing QR codes'],
    tags: ['landing page', 'join', 'qr', 'share'],
  },
];

const faqs = [
  {
    question: 'How do participants join?',
    answer:
      'Participants use the event code or join link shown by the host. They do not need to create an account to participate.',
  },
  {
    question: 'Can participants join anonymously?',
    answer:
      'Yes. Event settings include participant name behavior, and Q&A can support anonymous submissions when configured by the host.',
  },
  {
    question: 'How do I launch an activity?',
    answer:
      'Open an event, add or select an activity, then use the run controls to launch it for the audience.',
  },
  {
    question: 'Can I reuse an event?',
    answer:
      'Reusable event templates are not currently exposed as a dedicated feature. You can create a new event and add similar activities manually.',
  },
  {
    question: 'Can I export analytics?',
    answer:
      'Analytics views exist for events. Export availability depends on the current analytics surface; the Help Center does not add new export APIs.',
  },
  {
    question: 'Does AI publish automatically?',
    answer:
      'No. AI Studio drafts suggestions for review. The host chooses what to accept before creating or using activities.',
  },
  {
    question: 'Can I moderate questions?',
    answer:
      'Yes. Q&A includes moderation-oriented flows so hosts can review questions and keep the session focused.',
  },
  {
    question: 'Does dark mode persist?',
    answer:
      'Yes. The existing theme system stores your light, dark, or system preference in the browser.',
  },
  {
    question: 'What browsers are supported?',
    answer:
      'Pulse is designed for current versions of Chromium, Safari, Firefox, and mobile browsers that support modern web standards.',
  },
];

const shortcuts = [
  {
    keys: ['Ctrl', 'K'],
    label: 'Open command search',
    description: 'A future global command menu for finding events and actions.',
    future: true,
  },
  {
    keys: ['Esc'],
    label: 'Close dialogs',
    description: 'Dismiss modal surfaces and return focus to the previous control.',
    future: false,
  },
  {
    keys: ['Enter'],
    label: 'Confirm focused actions',
    description: 'Submit forms or activate the selected button when available.',
    future: false,
  },
  {
    keys: ['Tab'],
    label: 'Move through controls',
    description: 'Navigate interactive controls in a predictable focus order.',
    future: false,
  },
  {
    keys: ['Arrow keys'],
    label: 'Move inside grouped controls',
    description: 'Navigate menus, select fields, and future command surfaces.',
    future: false,
  },
];

const updates = [
  ['Dashboard redesign', 'A premium SaaS workspace for event hosts.'],
  ['AI Studio', 'Generate session drafts and summarize live audience answers.'],
  ['Presenter Mode', 'Focused live views for room displays and facilitation.'],
  ['Analytics', 'Event reporting surfaces for engagement and outcomes.'],
  ['AI Reply', 'AI-assisted drafting for Q&A response workflows.'],
  ['Dark Mode', 'Persistent light, dark, and system theme support.'],
  ['Settings', 'Centralized profile, appearance, security, and AI preferences.'],
  ['Landing Page redesign', 'Sharper first-run experience and participant entry.'],
] satisfies Array<[string, string]>;

function matchesSearch(query: string, values: string[]) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return values.some((value) => value.toLowerCase().includes(normalized));
}

function ComingSoonBadge() {
  return (
    <Badge variant="neutral" size="sm">
      Coming Soon
    </Badge>
  );
}

function HelpNav({ query, setQuery }: {
  query: string;
  setQuery: (query: string) => void;
}) {
  return (
    <SurfacePanel className="space-y-4 p-3">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search help..."
          aria-label="Search help center"
          className="pl-9"
        />
      </div>
      <nav aria-label="Help sections" className="space-y-1">
        {HELP_SECTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Icon className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-foreground" />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </SurfacePanel>
  );
}

function QuickGuideCard({ guide }: { guide: GuideItem }) {
  const Icon = guide.icon;
  return (
    <Card className="shadow-xs">
      <CardHeader className="flex-row items-start gap-3 space-y-0 p-5">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-brand">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base leading-tight">{guide.title}</CardTitle>
          <CardDescription className="leading-relaxed">
            {guide.description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

function FeatureCard({ guide }: { guide: FeatureGuide }) {
  const Icon = guide.icon;
  return (
    <Card className="shadow-xs">
      <CardHeader className="flex-row items-start gap-3 space-y-0 p-5">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-ink-secondary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base leading-tight">{guide.title}</CardTitle>
          <CardDescription className="leading-relaxed">
            {guide.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="flex flex-wrap gap-2">
          {guide.items.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HelpCenterPage() {
  const [query, setQuery] = React.useState('');

  const visibleQuickGuides = gettingStarted.filter((guide) =>
    matchesSearch(query, [guide.title, guide.description, ...guide.tags]),
  );

  const visibleFeatureGuides = featureGuides.filter((guide) =>
    matchesSearch(query, [
      guide.title,
      guide.description,
      ...guide.items,
      ...guide.tags,
    ]),
  );

  const visibleFaqs = faqs.filter((faq) =>
    matchesSearch(query, [faq.question, faq.answer]),
  );

  const noResults =
    query.trim() &&
    visibleQuickGuides.length === 0 &&
    visibleFeatureGuides.length === 0 &&
    visibleFaqs.length === 0;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Help Center"
        title="How can we help?"
        description="Find concise product guidance, feature references, shortcuts, and support paths without leaving the dashboard."
        badge={<Badge variant="brand">Built-in docs</Badge>}
      />

      <details className="lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-border bg-surface-card px-4 py-3 text-sm font-semibold text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <span className="inline-flex items-center gap-2">
            <PanelLeft className="h-4 w-4 text-ink-muted" />
            Browse Help Center
          </span>
          <ChevronDown className="h-4 w-4 text-ink-muted" />
        </summary>
        <div className="pt-3">
          <HelpNav query={query} setQuery={setQuery} />
        </div>
      </details>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <HelpNav query={query} setQuery={setQuery} />
        </aside>

        <div className="min-w-0 space-y-8">
          {noResults ? (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="No help articles found"
              description="Try searching for poll, quiz, analytics, AI, Q&A, export, or participant joining."
              action={
                <Button type="button" variant="outline" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              }
            />
          ) : null}

          <section id="getting-started" className="scroll-mt-24 space-y-4">
            <SectionHeader
              title="Getting Started"
              description="Short guides for the actions most hosts need in their first session."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleQuickGuides.map((guide) => (
                <QuickGuideCard key={guide.title} guide={guide} />
              ))}
            </div>
          </section>

          <section id="feature-guides" className="scroll-mt-24 space-y-4">
            <SectionHeader
              title="Feature Guides"
              description="A compact reference for each product area and the actions it supports today."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {visibleFeatureGuides.map((guide) => (
                <FeatureCard key={guide.title} guide={guide} />
              ))}
            </div>
          </section>

          <section id="faq" className="scroll-mt-24 space-y-4">
            <SectionHeader
              title="Frequently Asked Questions"
              description="Practical answers about participants, moderation, AI, analytics, and browser support."
            />
            <div className="space-y-3">
              {visibleFaqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-lg border border-border bg-surface-card shadow-xs"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    {faq.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-ink-secondary">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section id="shortcuts" className="scroll-mt-24 space-y-4">
            <SectionHeader
              title="Keyboard Shortcuts"
              description="Current keyboard behavior plus upcoming command shortcuts."
            />
            <Card className="shadow-xs">
              <CardContent className="divide-y divide-border p-0">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.label}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {shortcut.label}
                        </p>
                        {shortcut.future ? <ComingSoonBadge /> : null}
                      </div>
                      <p className="text-sm text-ink-muted">
                        {shortcut.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="rounded-md border border-border bg-surface-sunken px-2 py-1 font-mono text-xs font-semibold text-foreground"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section id="support" className="scroll-mt-24 space-y-4">
            <SectionHeader
              title="Contact & Support"
              description="Support workflows are planned; no backend ticketing or messaging API is connected yet."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Report a bug',
                  description:
                    'Share reproducible issues with event setup, live delivery, or analytics.',
                  icon: Bug,
                },
                {
                  title: 'Request a feature',
                  description:
                    'Suggest improvements for host workflows, participant experiences, or AI tools.',
                  icon: Lightbulb,
                },
                {
                  title: 'Contact support',
                  description:
                    'Reach the product team when support channels are connected.',
                  icon: Send,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="shadow-xs">
                    <CardHeader className="space-y-3 p-5">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface-sunken text-ink-secondary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base">
                            {item.title}
                          </CardTitle>
                          <ComingSoonBadge />
                        </div>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <Button type="button" variant="outline" disabled className="w-full">
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section id="whats-new" className="scroll-mt-24 space-y-4">
            <SectionHeader
              title="What's New"
              description="Recent product updates presented as a lightweight changelog."
            />
            <SurfacePanel className="p-0">
              <ol className="divide-y divide-border">
                {updates.map(([title, description], index) => (
                  <li key={title} className="flex gap-4 p-5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand">
                      {index === 0 ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-brand" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {title}
                      </p>
                      <p className="text-sm text-ink-muted">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </SurfacePanel>
          </section>

          <section id="product-info" className="scroll-mt-24 space-y-4">
            <SectionHeader
              title="Product Information"
              description="Static environment details for the current Pulse dashboard experience."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Pulse version', '0.1.0'],
                ['UI version', 'Pulse SaaS redesign'],
                ['Theme support', 'Light, Dark, System'],
                ['Powered by AI', 'AI Studio and insights'],
                ['Last updated', 'June 27, 2026'],
              ].map(([label, value]) => (
                <SurfacePanel key={label} tone="sunken" className="space-y-1 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                </SurfacePanel>
              ))}
              <SurfacePanel tone="ai" className="space-y-1 p-4">
                <div className="flex items-center gap-2">
                  <Command className="h-4 w-4 text-ai" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-ai">
                    Documentation search
                  </p>
                </div>
                <p className="text-sm font-semibold text-ai-subtle-text">
                  Local filtering only
                </p>
              </SurfacePanel>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
