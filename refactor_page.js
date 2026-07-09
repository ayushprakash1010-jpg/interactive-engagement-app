const fs = require('fs');
const path = 'c:/Users/ayush/Downloads/interactive-engagement-app/apps/web/src/app/dashboard/ai/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add new imports
const newImports = `import { AIWorkspaceHeader } from '@/components/ai-studio/AIWorkspaceHeader';
import { SessionConfigurationPanel, type SessionConfigState } from '@/components/ai-studio/SessionConfigurationPanel';
import { PromptEditor } from '@/components/ai-studio/PromptEditor';
import { DraftWorkspace } from '@/components/ai-studio/DraftWorkspace';
import { SuggestionPanel } from '@/components/ai-studio/SuggestionPanel';
import { WorkspaceStatus } from '@/components/ai-studio/WorkspaceStatus';
import { WorkspaceEmptyState } from '@/components/ai-studio/WorkspaceEmptyState';
import { GenerationProgress } from '@/components/ai-studio/GenerationProgress';
import { type DraftActivity } from '@/components/ai-studio/DraftActivityCard';`;

content = content.replace("import { cn } from '@/lib/utils';", "import { cn } from '@/lib/utils';\n" + newImports);

// 2. Remove old DraftActivity type to prevent duplicate identifier safely
const lines = content.split('\n');
const newLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('type DraftActivity = {')) {
    skip = true;
    continue;
  }
  if (skip && lines[i].startsWith('};')) {
    skip = false;
    continue;
  }
  if (!skip) {
    newLines.push(lines[i]);
  }
}
content = newLines.join('\n');

// 3. Replace the component AIStudioPage
const componentStart = content.indexOf('export default function AIStudioPage() {');
const componentEnd = content.lastIndexOf('}'); // assuming last brace is end of file

const newComponent = `export default function AIStudioPage() {
  const router = useRouter();

  // State Grouping
  const [sessionConfig, setSessionConfig] = React.useState<SessionConfigState>({
    title: '', description: '', audienceType: '', eventType: '', duration: '', expectedParticipants: '', tone: '', language: 'en'
  });
  
  const [prompt, setPrompt] = React.useState('');
  const [generating, setGenerating] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);

  const [generatedEvent, setGeneratedEvent] = React.useState<GeneratedEvent | null>(null);
  const [engagementInfo, setEngagementInfo] = React.useState<{ score: number; tip: string; } | null>(null);

  const [drafts, setDrafts] = React.useState<DraftActivity[]>([]);
  const [accepted, setAccepted] = React.useState<DraftActivity[]>([]);

  const [isCreatingEvent, setIsCreatingEvent] = React.useState(false);
  const [createEventError, setCreateEventError] = React.useState<string | null>(null);
  const [modifyingDraftId, setModifyingDraftId] = React.useState<string | null>(null);

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
    setCreateEventError(null);
    setDrafts([]);
    setAccepted([]);
    setGeneratedEvent(null);
    setSummaryResult(null);
    setEngagementInfo(null);

    try {
      const res = await fetch('/api/proxy/ai/generate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleanPrompt }),
      });

      if (!res.ok) {
        throw new Error(\`Failed to generate session. Server returned \${res.status}.\`);
      }

      const data = await res.json();
      const activities = Array.isArray(data.activities) ? data.activities : [];

      if (activities.length === 0) {
        throw new Error('AI did not return any activities. Please try again.');
      }

      setGeneratedEvent({
        title: sessionConfig.title || data.event?.title || cleanPrompt,
        description: sessionConfig.description || data.event?.description || 'An event generated using Pulse AI Studio.',
      });

      if (data.engagement) {
        setEngagementInfo({
          score: Number(data.engagement.score) || 85,
          tip: data.engagement.tip || 'Looking good!',
        });
      }

      setDrafts(
        activities.map((activity: any, index: number) =>
          normaliseActivity(activity, index),
        ),
      );
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-[1600px] flex-1 flex flex-col">
        <AIWorkspaceHeader 
          title={sessionConfig.title || 'Untitled Workspace'} 
          status={drafts.length > 0 || accepted.length > 0 ? 'Drafting' : 'Idle'}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start pb-12">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 h-auto">
            <SessionConfigurationPanel 
              config={sessionConfig}
              onChange={(updates) => setSessionConfig(prev => ({ ...prev, ...updates }))}
            />
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

            {generating ? (
              <GenerationProgress />
            ) : drafts.length === 0 && accepted.length === 0 ? (
              <WorkspaceEmptyState type="draft" />
            ) : (
              <DraftWorkspace 
                drafts={drafts}
                accepted={accepted}
                onAccept={acceptDraft}
                onDuplicate={() => {}}
                onDelete={dismissDraft}
                onEdit={() => {}}
              />
            )}
          </div>

          {/* Right Column: AI Suggestions & Status */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 flex flex-col gap-6 h-auto">
            <WorkspaceStatus 
              generatedCount={drafts.length + accepted.length}
              acceptedCount={accepted.length}
              estimatedDuration={sessionConfig.duration || '0m'}
              isGenerating={generating}
            />
            {drafts.length === 0 && accepted.length === 0 ? (
              <WorkspaceEmptyState type="suggestions" />
            ) : (
              <SuggestionPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

content = content.substring(0, componentStart) + newComponent;
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully refactored page.tsx');
