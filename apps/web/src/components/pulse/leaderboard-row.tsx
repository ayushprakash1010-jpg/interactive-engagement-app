import { cn } from '@/lib/utils';

const MEDAL: Record<number, string> = {
  1: 'bg-[#d19900] text-white',
  2: 'bg-[#9a9488] text-white',
  3: 'bg-[#b87333] text-white',
};

/** One quiz leaderboard row: rank, name, points. Top 3 get a medal tint. */
export function LeaderboardRow({
  rank,
  name,
  points = 0,
  you = false,
  inverse = false,
  className,
}: {
  rank: number;
  name: string;
  points?: number;
  you?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border px-3.5 py-2.5',
        you
          ? 'border-[color:var(--teal-300)] bg-brand-subtle'
          : cn('border-transparent', inverse ? 'bg-surface-raised' : 'bg-muted'),
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold tabular-nums',
          MEDAL[rank] ?? 'text-ink-muted',
        )}
      >
        {rank}
      </span>
      <span
        className={cn(
          'flex-1 truncate text-base text-foreground',
          you ? 'font-semibold' : 'font-medium',
        )}
      >
        {name}
        {you && <span className="font-normal text-brand"> · you</span>}
      </span>
      <span className="font-mono text-base font-bold tabular-nums text-foreground">
        {points.toLocaleString()}
        <span className="text-xs font-normal text-ink-faint"> pts</span>
      </span>
    </div>
  );
}
