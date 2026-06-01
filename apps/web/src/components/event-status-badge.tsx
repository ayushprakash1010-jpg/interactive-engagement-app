import type { EventStatus } from '@iep/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<EventStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  live: 'bg-green-100 text-green-700 hover:bg-green-100',
  ended: 'bg-zinc-200 text-zinc-600 hover:bg-zinc-200',
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <Badge variant="secondary" className={cn('capitalize', STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}
