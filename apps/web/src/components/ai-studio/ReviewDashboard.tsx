import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { type SessionReview, type ReviewFinding } from '@/lib/ai';
import { Activity, ShieldAlert, HeartPulse, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { PlanningDiff } from './PlanningDiff';

function OverallScore({ score, categories }: { score: number, categories: { label: string, score: number }[] }) {
  return (
    <Card className="border-border bg-card shadow-sm col-span-full md:col-span-1">
      <CardContent className="p-6 flex flex-col items-center justify-center h-full">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overall Quality</div>
        <div className="text-5xl font-bold text-primary mb-4">{score}<span className="text-2xl text-muted-foreground">/100</span></div>
        
        <div className="w-full space-y-3 mt-4">
          {categories.map(c => (
            <div key={c.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{c.label}</span>
                <span className="text-muted-foreground">{c.score}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", c.score > 90 ? 'bg-emerald-500' : c.score > 75 ? 'bg-amber-500' : 'bg-rose-500')}
                  style={{ width: `${c.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionHealthCard({ health }: { health: SessionReview['health'] }) {
  return (
    <Card className="border-border bg-card shadow-sm col-span-full md:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-rose-500" />
          Session Health
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Engagement Prediction</div>
          <div className="text-2xl font-bold">{health.engagementPrediction}%</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Audience Fatigue</div>
          <div className={cn("text-lg font-semibold", health.audienceFatigue === 'High Risk' ? 'text-rose-500' : 'text-emerald-500')}>
            {health.audienceFatigue}
          </div>
        </div>
        <div className="space-y-1 col-span-2 mt-2 pt-4 border-t">
          <div className="text-xs text-muted-foreground">Interaction Variety Index</div>
          <div className="text-lg font-semibold">{(health.varietyIndex * 10).toFixed(1)} / 10</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewCategoryCard({ 
  finding, 
  onAcceptProposal 
}: { 
  finding: ReviewFinding;
  onAcceptProposal?: (proposalId: string) => void;
}) {
  const isHigh = finding.severity === 'high' || finding.severity === 'critical';
  
  return (
    <Card className={cn(
      "border-l-4 shadow-sm",
      isHigh ? "border-l-rose-500" : "border-l-amber-500"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {isHigh ? <ShieldAlert className="h-5 w-5 text-rose-500" /> : <Activity className="h-5 w-5 text-amber-500" />}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{finding.category}</h4>
              <span className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded-full uppercase",
                isHigh ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
              )}>
                {finding.severity}
              </span>
            </div>
            <p className="text-sm text-foreground/80">{finding.reason}</p>
            <div className="bg-muted p-2 rounded text-xs text-muted-foreground font-mono">
              Evidence: {finding.evidence}
            </div>
            <div className="text-sm pt-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Suggestion: </span>
              {finding.suggestedFix}
            </div>

            {finding.proposedChange && onAcceptProposal && (
              <div className="mt-4">
                <PlanningDiff 
                  proposal={finding.proposedChange}
                  onAccept={onAcceptProposal}
                  onReject={() => {}} 
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewDashboard({ 
  review, 
  onAcceptProposal 
}: { 
  review: SessionReview | null;
  onAcceptProposal: (proposalId: string, newPlan: any) => void;
}) {
  if (!review) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
        Running AI Review Engine...
      </div>
    );
  }

  // Handle local accept delegation
  const handleAccept = (proposalId: string) => {
    const finding = review.findings.find(f => f.proposedChange?.id === proposalId);
    if (finding && finding.proposedChange) {
      onAcceptProposal(proposalId, finding.proposedChange.proposedPlan);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OverallScore score={review.overallScore} categories={review.categoryScores} />
        <SessionHealthCard health={review.health} />
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold tracking-tight">Review Findings</h3>
        {review.findings.length === 0 ? (
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center text-emerald-600 space-y-2">
              <CheckCircle2 className="h-8 w-8" />
              <p className="font-semibold">Session is perfectly optimized.</p>
              <p className="text-sm opacity-80">No structural or engagement issues detected.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {review.findings.map(f => (
              <ReviewCategoryCard 
                key={f.id} 
                finding={f} 
                onAcceptProposal={f.proposedChange ? handleAccept : undefined} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
