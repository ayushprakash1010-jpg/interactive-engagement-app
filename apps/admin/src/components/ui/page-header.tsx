import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
}

function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
  leading,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {leading}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-wider text-brand">
              {eyebrow}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="max-w-2xl text-sm text-ink-secondary">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export { PageHeader };
