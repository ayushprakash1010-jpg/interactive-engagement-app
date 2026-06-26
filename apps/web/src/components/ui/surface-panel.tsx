import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SurfacePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'card' | 'raised' | 'sunken' | 'brand' | 'ai';
}

const toneClass = {
  card: 'border-border bg-surface-card',
  raised: 'border-border bg-surface-raised',
  sunken: 'border-border bg-surface-sunken',
  brand: 'border-brand/30 bg-brand-subtle/40',
  ai: 'border-ai-border bg-ai-subtle',
};

function SurfacePanel({
  tone = 'card',
  className,
  ...props
}: SurfacePanelProps) {
  return (
    <div
      className={cn('rounded-lg border p-5 shadow-xs', toneClass[tone], className)}
      {...props}
    />
  );
}

export { SurfacePanel };
