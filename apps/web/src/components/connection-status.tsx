'use client';

import { useSocketStatus, type ConnectionStatus as Status } from '@/lib/socket-status';
import { cn } from '@/lib/utils';

const LABELS: Record<Status, string> = {
  connected: 'Live',
  reconnecting: 'Reconnecting',
  disconnected: 'Offline',
};

const STYLES: Record<Status, string> = {
  connected: 'bg-success-subtle text-success',
  reconnecting: 'bg-warning-subtle text-[#8a6500]',
  disconnected: 'bg-error-subtle text-destructive',
};

const DOT: Record<Status, string> = {
  connected: 'bg-live animate-pulse-live',
  reconnecting: 'bg-warning animate-pulse',
  disconnected: 'bg-destructive',
};

/** Small live indicator of the realtime socket connection. */
export function ConnectionStatus({ className }: { className?: string }) {
  const status = useSocketStatus((s) => s.status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        STYLES[status],
        className,
      )}
    >
      <span
        className={cn('h-[0.4375rem] w-[0.4375rem] shrink-0 rounded-full', DOT[status])}
        aria-hidden
      />
      {LABELS[status]}
    </span>
  );
}
