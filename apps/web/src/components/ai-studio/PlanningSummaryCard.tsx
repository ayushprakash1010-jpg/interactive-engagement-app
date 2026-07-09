import * as React from 'react';
import { Card, CardContent } from '@/components/ui';
import { type SessionPlan } from '@/lib/ai';
import { Target, Users, Clock, Zap, Activity, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlanningSummaryCard({ plan }: { plan: SessionPlan }) {
  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden mb-6">
      <div className="bg-muted/30 px-5 py-3 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Session Planning Summary
        </h2>
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-muted-foreground">Confidence:</span>
          <span className={cn(
            "px-2 py-0.5 rounded-full",
            plan.planningConfidence === 'High' ? "bg-emerald-500/10 text-emerald-600" :
            plan.planningConfidence === 'Medium' ? "bg-amber-500/10 text-amber-600" :
            "bg-rose-500/10 text-rose-600"
          )}>
            {plan.planningConfidence}
          </span>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          
          <div className="p-4 flex flex-col justify-center space-y-1 text-center md:text-left md:items-start">
            <span className="text-xs uppercase tracking-wide text-muted-foreground flex items-center justify-center md:justify-start gap-1">
              <Users className="h-3 w-3" /> Audience
            </span>
            <span className="font-semibold text-sm">{plan.audience}</span>
          </div>

          <div className="p-4 flex flex-col justify-center space-y-1 text-center md:text-left md:items-start">
            <span className="text-xs uppercase tracking-wide text-muted-foreground flex items-center justify-center md:justify-start gap-1">
              <Clock className="h-3 w-3" /> Duration
            </span>
            <span className="font-semibold text-sm">{plan.duration}</span>
          </div>

          <div className="p-4 flex flex-col justify-center space-y-1 text-center md:text-left md:items-start">
            <span className="text-xs uppercase tracking-wide text-muted-foreground flex items-center justify-center md:justify-start gap-1">
              <Zap className="h-3 w-3" /> Interactions
            </span>
            <span className="font-semibold text-sm">
              {plan.agenda.filter(a => a.purpose === 'engagement' || a.purpose === 'assessment').length} planned
            </span>
          </div>

          <div className="p-4 flex flex-col justify-center space-y-1 text-center md:text-left md:items-start bg-primary/5">
            <span className="text-xs uppercase tracking-wide text-primary flex items-center justify-center md:justify-start gap-1">
              <Activity className="h-3 w-3" /> Est. Engagement
            </span>
            <span className="font-bold text-lg text-primary">{plan.estimatedEngagement}%</span>
          </div>

        </div>
        
        <div className="bg-muted/10 p-4 border-t text-sm">
          <div className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-medium">Session Goal:</strong> {plan.objective}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
