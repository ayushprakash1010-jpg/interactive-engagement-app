import { DraftActivityCard, type DraftActivity } from './DraftActivityCard';
import { type SessionPlan } from '@/lib/ai';
import { type SessionReview } from '@/lib/ai';

export function DraftWorkspace({
  drafts,
  accepted,
  onAccept,
  onDuplicate,
  onDelete,
  onEdit,
  sessionPlan,
  sessionReview,
}: {
  drafts: DraftActivity[];
  accepted: DraftActivity[];
  onAccept: (activity: DraftActivity) => void;
  onDuplicate: (activity: DraftActivity) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  sessionPlan?: SessionPlan | null;
  sessionReview?: SessionReview | null;
}) {
  const getTimelineItem = (activityId: string) => {
    return sessionPlan?.agenda.find(item => item.activityId === activityId);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Accepted Activities */}
      {accepted.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 uppercase">
            Accepted Workspace
          </h2>
          <div className="flex flex-col gap-3">
            {accepted.map((activity) => (
              <DraftActivityCard
                key={activity.id}
                activity={activity}
                isAccepted
                onDuplicate={() => onDuplicate(activity)}
                onDelete={() => onDelete(activity.id)}
                onEdit={() => onEdit(activity.id)}
                timelineItem={getTimelineItem(activity.id)}
                review={sessionReview?.activityReviews?.[activity.id]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Drafts */}
      {drafts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase flex items-center justify-between">
            <span>Pending Review</span>
            <span className="bg-muted text-foreground px-2 py-0.5 rounded-full text-xs">
              {drafts.length}
            </span>
          </h2>
          <div className="flex flex-col gap-3">
            {drafts.map((activity) => (
              <DraftActivityCard
                key={activity.id}
                activity={activity}
                onAccept={() => onAccept(activity)}
                onDuplicate={() => onDuplicate(activity)}
                onDelete={() => onDelete(activity.id)}
                onEdit={() => onEdit(activity.id)}
                timelineItem={getTimelineItem(activity.id)}
                review={sessionReview?.activityReviews?.[activity.id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
