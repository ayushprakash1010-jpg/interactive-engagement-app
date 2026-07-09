const fs = require('fs');
const path = 'c:/Users/ayush/Downloads/interactive-engagement-app/apps/web/src/app/dashboard/ai/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add new imports
const newImports = `
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { type SessionReview, evaluateSession } from '@/lib/review-engine';
import { ReviewDashboard } from '@/components/ai-studio/ReviewDashboard';
`;
content = content.replace("import { type CopilotState } from '@/lib/copilot-engine';", "import { type CopilotState } from '@/lib/copilot-engine';" + newImports);

// 2. Add SessionReview State and Effect
const stateReplacement = `
  // Phase 4 Review State
  const [sessionReview, setSessionReview] = React.useState<SessionReview | null>(null);
  
  React.useEffect(() => {
    if (sessionPlan && (drafts.length > 0 || accepted.length > 0)) {
      evaluateSession(sessionPlan, [...drafts, ...accepted]).then(rev => setSessionReview(rev));
    } else {
      setSessionReview(null);
    }
  }, [sessionPlan, drafts, accepted]);
`;
content = content.replace(/const \[generating, setGenerating\] = React.useState\(false\);/, "const [generating, setGenerating] = React.useState(false);\n" + stateReplacement);

// 3. Update Center Column to use Tabs
const centerColumnRegex = /\{generating \? \([\s\S]*?\} \/\* end of center column/m;
const centerColumnStart = content.indexOf('{generating ? (');
const centerColumnEnd = content.indexOf('          {/* Right Column', centerColumnStart);

const oldCenterContent = content.substring(centerColumnStart, centerColumnEnd).trim();

const newCenterContent = `
            {generating ? (
              <GenerationProgress />
            ) : drafts.length === 0 && accepted.length === 0 ? (
              <WorkspaceEmptyState type="draft" />
            ) : (
              <Tabs defaultValue="plan" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="plan">Session Plan</TabsTrigger>
                  <TabsTrigger value="review">AI Review & Optimization</TabsTrigger>
                </TabsList>
                
                <TabsContent value="plan" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            )}
`;

content = content.substring(0, centerColumnStart) + newCenterContent + "\n" + content.substring(centerColumnEnd);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully refactored page.tsx for Phase 4 Review Tabs');
