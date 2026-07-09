const fs = require('fs');
const path = 'c:/Users/ayush/Downloads/interactive-engagement-app/apps/web/src/app/dashboard/ai/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add new imports
const newImports = `
import { CopilotPanel } from '@/components/ai-studio/CopilotPanel';
import { SessionHistory } from '@/components/ai-studio/SessionHistory';
import { type CopilotState } from '@/lib/copilot-engine';
`;

// Remove SuggestionPanel import since it will be replaced by CopilotPanel
content = content.replace("import { SuggestionPanel } from '@/components/ai-studio/SuggestionPanel';\n", "");

// Insert imports safely after PlanningInsights
content = content.replace("import { PlanningInsights } from '@/components/ai-studio/PlanningInsights';", "import { PlanningInsights } from '@/components/ai-studio/PlanningInsights';" + newImports);

// 2. Add Copilot State to AIStudioPage
const stateReplacement = `
  // Phase 2 Planner State
  const [sessionPlan, setSessionPlan] = React.useState<SessionPlan | null>(null);

  // Phase 3 Copilot State
  const [copilotState, setCopilotState] = React.useState<CopilotState>({
    messages: [],
    pendingChange: null,
    history: [],
    isProcessing: false,
  });
`;
content = content.replace("  // Phase 2 Planner State\n  const [sessionPlan, setSessionPlan] = React.useState<SessionPlan | null>(null);", stateReplacement);

// 3. Reset copilot state in handleGenerate
const handleGenerateUpdateStr = `
    setDrafts([]);
    setAccepted([]);
    setGeneratedEvent(null);
    setSummaryResult(null);
    setEngagementInfo(null);
    setSessionPlan(null);
    setCopilotState({ messages: [], pendingChange: null, history: [], isProcessing: false });
`;
content = content.replace(`
    setDrafts([]);
    setAccepted([]);
    setGeneratedEvent(null);
    setSummaryResult(null);
    setEngagementInfo(null);`, handleGenerateUpdateStr.trim());

// 4. Update the Left Column to include SessionHistory below SessionConfigurationPanel
const leftColumnStr = `
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
`;
content = content.replace(/\{\/\* Left Column: Configuration \*\/\}[\s\S]*?<\/div>/, leftColumnStr.trim());

// 5. Update the Right Column to remove SuggestionPanel and add CopilotPanel
const rightColumnStr = `
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
`;
content = content.replace(/\{\/\* Right Column: AI Suggestions & Status \*\/\}[\s\S]*?<\/div>/, rightColumnStr.trim());

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully refactored page.tsx for Phase 3 Copilot');
