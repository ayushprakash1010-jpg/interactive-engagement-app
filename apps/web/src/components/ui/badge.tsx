import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Pulse Badge — compact status / category pill.
 * Tones map to Pulse semantic colors; `live` animates its dot (on-air).
 * Pass `dot` to show a leading status dot.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-tight tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        neutral: 'bg-secondary text-secondary-foreground',
        brand: 'bg-brand-subtle text-brand-subtle-text',
        success: 'bg-success-subtle text-success',
        warning: 'bg-warning-subtle text-[#8a6500]',
        destructive: 'bg-error-subtle text-destructive',
        info: 'bg-info-subtle text-info',
        ai: 'bg-ai-subtle text-ai-subtle-text',
        live: 'bg-success-subtle text-success',
        outline: 'border border-border text-foreground',
      },
      size: {
        sm: 'px-2 py-px text-2xs',
        md: 'px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

const dotColor: Record<string, string> = {
  default: 'bg-ink-muted',
  neutral: 'bg-ink-muted',
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
  ai: 'bg-ai',
  live: 'bg-live',
  outline: 'bg-ink-muted',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot = false, children, ...props }: BadgeProps) {
  const isLive = variant === 'live';
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {(dot || isLive) && (
        <span
          aria-hidden
          className={cn(
            'h-[0.4375rem] w-[0.4375rem] shrink-0 rounded-full',
            dotColor[variant ?? 'default'],
            isLive && 'animate-pulse-live',
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
