import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'ai' | 'destructive';
}

const toneClass = {
  neutral: 'bg-surface-sunken text-ink-muted',
  brand: 'bg-brand-subtle text-brand',
  ai: 'bg-ai-subtle text-ai',
  destructive: 'bg-error-subtle text-destructive',
};

function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'neutral',
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface-card px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            'inline-flex h-12 w-12 items-center justify-center rounded-full',
            toneClass[tone],
          )}
        >
          {icon}
        </span>
      )}
      <div className="space-y-1">
        <p className="font-display text-lg font-semibold text-foreground">
          {title}
        </p>
        {description && (
          <p className="mx-auto max-w-md text-sm text-ink-secondary">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

export { EmptyState };
