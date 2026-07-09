import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Activity } from 'lucide-react';
import { type EngagementEvent } from '@/lib/ai';

export function EngagementJourney({ journey }: { journey: EngagementEvent[] }) {
  if (journey.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm h-full">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Engagement Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative border-l-2 border-border/50 ml-3 space-y-6 pb-2">
          {journey.map((event, i) => (
            <div key={i} className="relative pl-6">
              <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background ${
                event.impact === 'Positive' ? 'bg-emerald-500' :
                event.impact === 'Negative' ? 'bg-red-500' :
                'bg-muted-foreground'
              }`} />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {event.time}
                </span>
                <p className="text-sm text-foreground leading-snug">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
