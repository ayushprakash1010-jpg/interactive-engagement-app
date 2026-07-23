import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-3',
        className,
      )}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-sm text-ink-secondary">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export { SectionHeader };
