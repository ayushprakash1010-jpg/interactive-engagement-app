import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface RadioCardGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: RadioCardOption[];
  className?: string;
  columns?: 1 | 2 | 3;
}

export function RadioCardGroup({
  value,
  onValueChange,
  options,
  className,
  columns = 3,
}: RadioCardGroupProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
  }[columns];

  return (
    <div className={cn("grid gap-3", gridClass, className)} role="radiogroup">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'flex flex-col items-start rounded-md border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              active
                ? 'border-brand bg-brand-subtle text-brand-subtle-text ring-1 ring-brand'
                : 'border-border bg-surface-card hover:bg-surface-sunken hover:border-brand/40'
            )}
          >
            {option.icon && (
              <span className={cn(
                "mb-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                active ? "bg-brand text-brand-text" : "bg-surface-sunken text-ink-muted"
              )}>
                {option.icon}
              </span>
            )}
            <span className="block text-sm font-semibold">{option.label}</span>
            {option.description && (
              <span className={cn(
                "mt-1 block text-xs line-clamp-2",
                active ? "text-brand-subtle-text/80" : "text-ink-muted"
              )}>
                {option.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
