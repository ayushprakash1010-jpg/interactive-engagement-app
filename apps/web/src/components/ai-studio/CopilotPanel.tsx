import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Sparkles, Bot, User } from 'lucide-react';
import { type CopilotState, type CopilotIntent, ai } from '@/lib/ai';
import { type SessionPlan, type ProposedChange } from '@/lib/ai';
import { CopilotComposer } from './CopilotComposer';
import { QuickActionBar } from './QuickActionBar';
import { PlanningDiff } from './PlanningDiff';

export function CopilotPanel({
  copilotState,
  setCopilotState,
  currentPlan,
  onPlanMutated
}: {
  copilotState: CopilotState;
  setCopilotState: React.Dispatch<React.SetStateAction<CopilotState>>;
  currentPlan: SessionPlan;
  onPlanMutated: (newPlan: SessionPlan) => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [copilotState.messages, copilotState.pendingChange]);

  const handleIntent = async (intent: CopilotIntent) => {
    // 1. Add user message
    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: intent.description,
      timestamp: Date.now()
    };

    setCopilotState(prev => ({
      ...prev,
      isProcessing: true,
      messages: [...prev.messages, userMsg]
    }));

    // 2. Generate Proposal via AI Core
    const result = await ai.copilot.mutatePlan(intent.description, currentPlan, [], []);
    const proposal: ProposedChange = {
      id: `proposal-${Date.now()}`,
      originalPlan: currentPlan,
      proposedPlan: result.newPlan,
      diffSummary: result.diffSummary,
      reasoning: result.reasoning,
      confidence: result.confidence,
      affectedActivities: result.affectedActivities,
      estimatedImpact: result.estimatedImpact,
      status: 'pending'
    };

    // 3. Add AI response with diff
    const aiMsg = {
      id: `msg-${Date.now()+1}`,
      role: 'assistant' as const,
      content: "I've drafted a proposed update for the session plan based on your request. Please review the changes below.",
      proposedChangeId: proposal.id,
      timestamp: Date.now() + 1
    };

    setCopilotState(prev => ({
      ...prev,
      isProcessing: false,
      pendingChange: proposal,
      messages: [...prev.messages, aiMsg],
      history: [...prev.history, { description: `Proposed: ${intent.description}`, timestamp: Date.now(), type: 'ai' }]
    }));
  };

  const acceptProposal = (id: string) => {
    if (!copilotState.pendingChange || copilotState.pendingChange.id !== id) return;
    const newPlan = copilotState.pendingChange.proposedPlan;
    
    setCopilotState(prev => ({
      ...prev,
      pendingChange: null,
      history: [...prev.history, { description: `Accepted proposed changes`, timestamp: Date.now(), type: 'accepted' }]
    }));
    onPlanMutated(newPlan);
  };

  const rejectProposal = (id: string) => {
    if (!copilotState.pendingChange || copilotState.pendingChange.id !== id) return;
    setCopilotState(prev => ({
      ...prev,
      pendingChange: null,
      history: [...prev.history, { description: `Rejected proposed changes`, timestamp: Date.now(), type: 'rejected' }]
    }));
  };

  return (
    <Card className="border-border bg-card shadow-sm h-full flex flex-col min-h-[500px]">
      <CardHeader className="pb-3 border-b shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          AI Copilot
        </CardTitle>
        <CardDescription>Iterate on your plan via conversation.</CardDescription>
      </CardHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {copilotState.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3">
            <Bot className="h-10 w-10 text-muted/50" />
            <p className="text-sm max-w-[200px]">I can help you adjust the timeline, change the tone, or add new activities.</p>
          </div>
        ) : (
          copilotState.messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                {msg.role === 'assistant' ? (
                  <div className="mt-0.5 bg-indigo-500/10 text-indigo-500 p-1.5 rounded-md shrink-0">
                    <Sparkles className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="mt-0.5 bg-muted text-muted-foreground p-1.5 rounded-md shrink-0">
                    <User className="h-3 w-3" />
                  </div>
                )}
                <div className="text-sm pt-0.5 leading-relaxed">
                  {msg.content}
                </div>
              </div>
              
              {/* If this message contains the pending diff */}
              {msg.proposedChangeId && copilotState.pendingChange?.id === msg.proposedChangeId && (
                <div className="pl-8 pr-2">
                  <PlanningDiff 
                    proposal={copilotState.pendingChange}
                    onAccept={acceptProposal}
                    onReject={rejectProposal}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t shrink-0 bg-muted/20 space-y-3">
        <QuickActionBar onSelect={handleIntent} />
        <CopilotComposer onSubmit={handleIntent} isProcessing={copilotState.isProcessing} />
      </div>
    </Card>
  );
}
