import { cn } from '@/lib/utils';

const DATA_BG = [
  'bg-data-1',
  'bg-data-2',
  'bg-data-3',
  'bg-data-4',
  'bg-data-5',
  'bg-data-6',
  'bg-data-7',
  'bg-data-8',
];

/**
 * A single horizontal poll-result bar with label, growing fill, count and %.
 * `index` picks the bar color from the Pulse categorical data palette.
 * Use `inverse` on dark / .pulse-stage surfaces.
 */
export function PollResult({
  label,
  count = 0,
  total = 0,
  index = 0,
  leading = false,
  inverse = false,
  className,
}: {
  label: string;
  count?: number;
  total?: number;
  index?: number;
  leading?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barColor = DATA_BG[index % DATA_BG.length];
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={cn(
            'text-sm text-foreground',
            leading ? 'font-semibold' : 'font-medium',
          )}
        >
          {label}
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums text-ink-secondary">
          {pct}% <span className="font-normal text-ink-faint">· {count}</span>
        </span>
      </div>
      <div
        className={cn(
          'relative h-2.5 overflow-hidden rounded-full',
          inverse ? 'bg-white/10' : 'bg-muted',
        )}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 origin-left rounded-full transition-[width] duration-slow ease-out',
            barColor,
            leading && 'shadow-glow-brand',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
