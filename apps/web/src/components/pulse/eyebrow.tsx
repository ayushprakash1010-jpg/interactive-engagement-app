import * as React from 'react';
import { cn } from '@/lib/utils';

/** Tracked-out uppercase label — the only uppercase treatment in Pulse. */
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-wider text-brand',
        className,
      )}
      {...props}
    />
  );
}
