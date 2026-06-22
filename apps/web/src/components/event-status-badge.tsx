import type { EventStatus } from '@iep/types';
import { Badge, type BadgeProps } from '@/components/ui/badge';

const STATUS_VARIANT: Record<EventStatus, NonNullable<BadgeProps['variant']>> = {
  draft: 'neutral',
  live: 'live',
  ended: 'outline',
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} dot className="capitalize">
      {status}
    </Badge>
  );
}
