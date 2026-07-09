import * as React from 'react';
import { type TimelineItem } from '@/lib/ai';
import { cn } from '@/lib/utils';
import { Clock, PlayCircle, StopCircle, Zap, LayoutTemplate } from 'lucide-react';

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  return `00:${m.toString().padStart(2, '0')}`;
}

export function AgendaTimeline({ agenda }: { agenda: TimelineItem[] }) {
  return (
    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {agenda.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === agenda.length - 1;
        const isActivity = !!item.activityId;

        let Icon = LayoutTemplate;
        if (isFirst) Icon = PlayCircle;
        else if (isLast) Icon = StopCircle;
        else if (isActivity) Icon = Zap;

        return (
          <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon marker */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10",
              isActivity ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <Icon className="h-4 w-4" />
            </div>
            
            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm group-hover:border-primary/50 transition-colors my-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {formatMinutes(item.timeOffsetMinutes)}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {item.durationMinutes} min
                </span>
              </div>
              <h4 className={cn("font-medium text-sm", isActivity && "text-primary")}>
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {item.purpose}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
