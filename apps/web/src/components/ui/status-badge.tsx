import * as React from 'react';
import { Badge, type BadgeProps } from '@/components/ui/badge';

const STATUS_VARIANT = {
  neutral: 'neutral',
  draft: 'neutral',
  pending: 'warning',
  live: 'live',
  active: 'success',
  success: 'success',
  ended: 'outline',
  closed: 'outline',
  error: 'destructive',
  destructive: 'destructive',
  ai: 'ai',
} satisfies Record<string, NonNullable<BadgeProps['variant']>>;

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: keyof typeof STATUS_VARIANT | string;
  variant?: BadgeProps['variant'];
}

function StatusBadge({
  status,
  variant,
  children,
  dot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const normalized = String(status).toLowerCase();
  const mappedVariant =
    variant ?? STATUS_VARIANT[normalized as keyof typeof STATUS_VARIANT] ?? 'neutral';

  return (
    <Badge
      variant={mappedVariant}
      dot={dot}
      className={className}
      {...props}
    >
      {children ?? normalized}
    </Badge>
  );
}

export { StatusBadge };
