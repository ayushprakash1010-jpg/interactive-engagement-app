import { cn } from '@/lib/utils';

/** The animated "on-air" dot. Pulses while live. */
export function LiveDot({
  live = true,
  className,
  sizeClass = 'h-2.5 w-2.5',
}: {
  live?: boolean;
  className?: string;
  sizeClass?: string;
}) {
  return (
    <span className={cn('relative inline-flex', sizeClass, className)}>
      {live && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-live animate-pulse-live"
        />
      )}
      <span className="relative h-full w-full rounded-full bg-live" />
    </span>
  );
}
