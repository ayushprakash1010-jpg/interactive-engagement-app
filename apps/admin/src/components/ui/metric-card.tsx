import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: React.ReactNode;
}

function MetricCard({
  label,
  value,
  description,
  icon,
  trend,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)} {...props}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-ink-muted">{label}</p>
            <div className="font-display text-3xl font-bold leading-none tracking-tight text-foreground">
              {value}
            </div>
          </div>
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-ink-secondary">
              {icon}
            </div>
          )}
        </div>
        {(description || trend) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            {trend && <span className="font-semibold text-brand">{trend}</span>}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { MetricCard };
