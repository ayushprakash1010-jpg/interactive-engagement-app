import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Small "AI" pill — always paired with the sparkles glyph in iris.
 * `gradient` uses the iris→teal AI gradient for hero moments.
 */
export function AIBadge({
  label = 'AI',
  gradient = false,
  size = 'md',
  className,
}: {
  label?: string;
  gradient?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold leading-tight tracking-wide',
        size === 'sm' ? 'px-2 py-px text-2xs' : 'px-2.5 py-0.5 text-xs',
        gradient
          ? 'bg-ai-gradient text-white'
          : 'bg-ai-subtle text-ai-subtle-text',
        className,
      )}
    >
      <Sparkles className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </span>
  );
}
