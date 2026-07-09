import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { type SessionPlan } from '@/lib/ai';
import { LineChart, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlanningInsights({ plan }: { plan: SessionPlan }) {
  return (
    <Card className="border-border bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <LineChart className="h-5 w-5 text-indigo-500" />
          Planning Insights
        </CardTitle>
        <CardDescription>AI evaluation of your session plan.</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 space-y-5">
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              Duration Fit
            </span>
            <span className={cn(
              "text-xs font-bold",
              plan.durationFit >= 90 ? "text-emerald-500" : "text-amber-500"
            )}>
              {plan.durationFit}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all", plan.durationFit >= 90 ? "bg-emerald-500" : "bg-amber-500")}
              style={{ width: `${plan.durationFit}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            The planned activities fit well within the {plan.duration} block.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              Audience Match
            </span>
            <span className="text-xs font-bold text-emerald-500">High</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full transition-all bg-emerald-500 w-[85%]" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Tone and complexity are appropriate for {plan.audience}.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              Interaction Variety
            </span>
            <span className={cn(
              "text-xs font-bold",
              plan.interactionVariety === 'Excellent' ? "text-emerald-500" :
              plan.interactionVariety === 'Good' ? "text-blue-500" : "text-amber-500"
            )}>
              {plan.interactionVariety}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {plan.interactionVariety === 'Needs Variety' 
              ? 'Consider mixing different activity types.'
              : 'Good mix of assessment and engagement.'}
          </p>
        </div>

      </CardContent>
    </Card>
  );
}

// Local mock to avoid importing Clock again if not needed
function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
