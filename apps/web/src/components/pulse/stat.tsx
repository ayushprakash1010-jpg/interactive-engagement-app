import * as React from 'react';
import { cn } from '@/lib/utils';

/** Headline metric for dashboards & analytics — big tabular number + label. */
export function Stat({
  value,
  label,
  sub,
  icon,
  tone = 'default',
  className,
}: {
  value: React.ReactNode;
  label: string;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'default' | 'brand' | 'ai';
  className?: string;
}) {
  const accent =
    tone === 'brand' ? 'text-brand' : tone === 'ai' ? 'text-ai' : 'text-foreground';
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-muted">{label}</span>
        {icon && <span className="text-ink-faint">{icon}</span>}
      </div>
      <span
        className={cn(
          'font-display text-3xl font-bold leading-none tracking-tight tabular-nums',
          accent,
        )}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-ink-muted">{sub}</span>}
    </div>
  );
}
