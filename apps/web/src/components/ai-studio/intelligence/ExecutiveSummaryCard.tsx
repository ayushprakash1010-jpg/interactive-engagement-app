import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { type PostEventIntelligence } from '@/lib/ai';

export function ExecutiveSummaryCard({ summary }: { summary: PostEventIntelligence['executiveSummary'] }) {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden bg-gradient-to-br from-surface-card to-muted/20">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Meeting Goal</h4>
            <p className="text-sm text-foreground leading-relaxed">{summary.meetingGoal}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Overall Success</h4>
            <p className="text-sm font-medium text-emerald-600 leading-relaxed">{summary.overallSuccess}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Participation</h4>
            <p className="text-sm text-foreground leading-relaxed">{summary.participationOverview}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Major Outcomes</h4>
            <p className="text-sm text-foreground leading-relaxed">{summary.majorOutcomes}</p>
          </div>
          <div className="rounded-lg bg-brand/5 p-3 border border-brand/10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand mb-1">Critical Observations</h4>
            <p className="text-sm text-foreground leading-relaxed">{summary.criticalObservations}</p>
          </div>
          <div className="rounded-lg bg-amber-500/5 p-3 border border-amber-500/10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">Key Recommendations</h4>
            <p className="text-sm text-foreground leading-relaxed">{summary.keyRecommendations}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
