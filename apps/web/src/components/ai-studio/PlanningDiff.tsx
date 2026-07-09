import * as React from 'react';
import { Card, Button } from '@/components/ui';
import { Check, X, GitPullRequestDraft } from 'lucide-react';
import { type ProposedChange } from '@/lib/ai';

export function PlanningDiff({
  proposal,
  onAccept,
  onReject
}: {
  proposal: ProposedChange;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (proposal.status !== 'pending') return null;

  return (
    <Card className="border-primary/30 bg-primary/5 p-4 shadow-sm relative overflow-hidden my-3">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      
      <div className="flex items-center gap-2 mb-3">
        <GitPullRequestDraft className="h-4 w-4 text-primary" />
        <h4 className="font-semibold text-sm text-primary">Proposed Changes</h4>
      </div>

      <ul className="space-y-1.5 mb-4 text-sm text-muted-foreground list-disc pl-4">
        {proposal.diffSummary.map((diff, i) => (
          <li key={i}>{diff}</li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onAccept(proposal.id)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Check className="h-4 w-4 mr-1.5" /> Accept
        </Button>
        <Button size="sm" variant="outline" onClick={() => onReject(proposal.id)} className="w-full">
          <X className="h-4 w-4 mr-1.5" /> Reject
        </Button>
      </div>
    </Card>
  );
}
