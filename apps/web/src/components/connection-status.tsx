'use client';

import { useSocketStatus, type ConnectionStatus as Status } from '@/lib/socket-status';
import { cn } from '@/lib/utils';

const LABELS: Record<Status, string> = {
  connected: 'Connected',
  reconnecting: 'Reconnecting…',
  disconnected: 'Disconnected',
};

const DOT: Record<Status, string> = {
  connected: 'bg-green-500',
  reconnecting: 'bg-amber-500 animate-pulse',
  disconnected: 'bg-red-500',
};

/** Small live indicator of the realtime socket connection. */
export function ConnectionStatus({ className }: { className?: string }) {
  const status = useSocketStatus((s) => s.status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-xs text-muted-foreground',
        className,
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', DOT[status])} aria-hidden />
      {LABELS[status]}
    </span>
  );
}
