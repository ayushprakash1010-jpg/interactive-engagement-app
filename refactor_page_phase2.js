const fs = require('fs');
const path = 'c:/Users/ayush/Downloads/interactive-engagement-app/apps/web/src/app/dashboard/ai/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add new imports
const newImports = `
import { PlanningSummaryCard } from '@/components/ai-studio/PlanningSummaryCard';
import { AgendaTimeline } from '@/components/ai-studio/AgendaTimeline';
import { PlanningInsights } from '@/components/ai-studio/PlanningInsights';
import { type SessionPlan, generateSessionPlan } from '@/lib/session-planner';
`;

// Insert imports safely after DraftActivityCard import
content = content.replace("import { type DraftActivity } from '@/components/ai-studio/DraftActivityCard';", "import { type DraftActivity } from '@/components/ai-studio/DraftActivityCard';" + newImports);

// Update component state
const stateReplacement = `
  const [modifyingDraftId, setModifyingDraftId] = React.useState<string | null>(null);

  // Phase 2 Planner State
  const [sessionPlan, setSessionPlan] = React.useState<SessionPlan | null>(null);
`;
content = content.replace("const [modifyingDraftId, setModifyingDraftId] = React.useState<string | null>(null);", stateReplacement);

// Update handleGenerate
// Find the `setDrafts(` call block and add generateSessionPlan
const handleGenerateUpdateStr = `
      const parsedActivities = activities.map((activity: any, index: number) =>
        normaliseActivity(activity, index),
      );
      setDrafts(parsedActivities);

      // Phase 2: Generate Session Plan
      const newPlan = generateSessionPlan(sessionConfig, parsedActivities, data.engagement ? {
        score: Number(data.engagement.score) || 85,
        tip: data.engagement.tip || 'Looking good!'
      } : null, {
        title: sessionConfig.title || data.event?.title || cleanPrompt,
        description: sessionConfig.description || data.event?.description || 'An event generated using Pulse AI Studio.'
      });
      setSessionPlan(newPlan);
`;

const handleGenerateToReplace = `
      setDrafts(
        activities.map((activity: any, index: number) =>
          normaliseActivity(activity, index),
        ),
      );
`;
content = content.replace(handleGenerateToReplace, handleGenerateUpdateStr);

// Update the DraftWorkspace rendering to include sessionPlan
const draftWorkspaceStr = `
              <DraftWorkspace 
                drafts={drafts}
                accepted={accepted}
                onAccept={acceptDraft}
                onDuplicate={() => {}}
                onDelete={dismissDraft}
                onEdit={() => {}}
                sessionPlan={sessionPlan}
              />
`;
const oldDraftWorkspaceStr = `
              <DraftWorkspace 
                drafts={drafts}
                accepted={accepted}
                onAccept={acceptDraft}
                onDuplicate={() => {}}
                onDelete={dismissDraft}
                onEdit={() => {}}
              />
`;
content = content.replace(oldDraftWorkspaceStr, draftWorkspaceStr);

// Update Left/Center/Right columns.
// Right Column: AI Suggestions & Status
// If sessionPlan is available, use PlanningInsights and pass recommendations to SuggestionPanel
const rightColumnStr = `
          {/* Right Column: AI Suggestions & Status */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 flex flex-col gap-6 h-auto">
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
            
            {drafts.length === 0 && accepted.length === 0 ? (
              <WorkspaceEmptyState type="suggestions" />
            ) : (
              <SuggestionPanel recommendations={sessionPlan?.recommendations} />
            )}
          </div>
`;
content = content.replace(/\{\/\* Right Column: AI Suggestions & Status \*\/\}[\s\S]*?<\/div>/, rightColumnStr.trim());

// Center column: Inject PlanningSummaryCard and AgendaTimeline before DraftWorkspace
const centerColumnStr = `
            {generating ? (
              <GenerationProgress />
            ) : drafts.length === 0 && accepted.length === 0 ? (
              <WorkspaceEmptyState type="draft" />
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  />
                </div>
              </div>
            )}
`;
const oldCenterColumnRegex = /\{generating \? \([\s\S]*?<\/DraftWorkspace>[\s\S]*?\)\}/;
content = content.replace(oldCenterColumnRegex, centerColumnStr.trim());

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully refactored page.tsx for Phase 2');
