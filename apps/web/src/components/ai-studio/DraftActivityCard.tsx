import * as React from 'react';
import { Card, CardContent } from '@/components/ui';
import { type ActivityType } from '@/components/pulse';
import { 
  GripVertical, 
  Pencil, 
  Copy, 
  Trash2, 
  Sparkles,
  BarChart3,
  ListChecks,
  Cloud,
  HelpCircle,
  Star,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { type TimelineItem } from '@/lib/ai';
import { type ActivityReview } from '@/lib/ai';

export type DraftActivity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  config?: Record<string, unknown>;
};

const ICON_BY_TYPE: Record<ActivityType, React.ReactNode> = {
  poll: <BarChart3 className="h-5 w-5" />,
  quiz: <ListChecks className="h-5 w-5" />,
  wordcloud: <Cloud className="h-5 w-5" />,
  qa: <HelpCircle className="h-5 w-5" />,
  feedback: <Star className="h-5 w-5" />,
  survey: <ClipboardList className="h-5 w-5" />,
  ai: <Sparkles className="h-5 w-5" />,
};

const COLOR_BY_TYPE: Record<ActivityType, string> = {
  poll: 'text-blue-500 bg-blue-500/10',
  quiz: 'text-emerald-500 bg-emerald-500/10',
  wordcloud: 'text-purple-500 bg-purple-500/10',
  qa: 'text-amber-500 bg-amber-500/10',
  feedback: 'text-rose-500 bg-rose-500/10',
  survey: 'text-indigo-500 bg-indigo-500/10',
  ai: 'text-pink-500 bg-pink-500/10',
};

export function DraftActivityCard({
  activity,
  isAccepted,
  onAccept,
  onDuplicate,
  onDelete,
  onEdit,
  timelineItem,
  review,
}: {
  activity: DraftActivity;
  isAccepted?: boolean;
  onAccept?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  timelineItem?: TimelineItem;
  review?: ActivityReview;
}) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all hover:shadow-md",
      isAccepted ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-border hover:border-border/80"
    )}>
      {/* Drag handle area (visual only for now) */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab bg-muted/30 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <CardContent className="p-4 pl-10 flex items-start gap-4">
        {/* Icon */}
        <div className={cn("p-2 rounded-lg shrink-0", COLOR_BY_TYPE[activity.type] || COLOR_BY_TYPE.ai)}>
          {ICON_BY_TYPE[activity.type] || ICON_BY_TYPE.ai}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">{activity.title}</h3>
            {isAccepted && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            )}
            {timelineItem && (
              <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground ml-2 border">
                {timelineItem.timeOffsetMinutes}m ({timelineItem.durationMinutes}m duration)
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {activity.description}
          </p>
          
          {review && (
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
              <span className={cn("px-1.5 py-0.5 rounded", review.quality > 85 ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>
                Quality: {review.quality}
              </span>
              <span>Time: {review.readingTimeSec}s</span>
              <span>Bias: {review.bias}</span>
              <span>Diff: {review.difficulty}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onAccept && !isAccepted && (
            <Button size="sm" variant="default" onClick={onAccept} className="mr-2">
              Accept
            </Button>
          )}
          
          <Button size="icon" variant="ghost" className="h-8 w-8" disabled title="Improve with AI">
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDuplicate} title="Duplicate">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
