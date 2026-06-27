import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Pulse brand marks. Never redraw the logo — these reference the copied SVG
 * assets in /public/brand. Use `dark` on dark / .pulse-stage surfaces.
 */
export function Wordmark({
  dark = false,
  className,
  width = 132,
}: {
  dark?: boolean;
  className?: string;
  width?: number;
}) {
  if (!dark) {
    return (
      <>
        <Image
          src="/brand/pulse-wordmark.svg"
          alt="Pulse"
          width={width}
          height={Math.round((width / 208) * 56)}
          priority
          unoptimized
          className={cn('theme-wordmark-light select-none', className)}
        />
        <Image
          src="/brand/pulse-wordmark-dark.svg"
          alt="Pulse"
          width={width}
          height={Math.round((width / 208) * 56)}
          priority
          unoptimized
          className={cn('theme-wordmark-dark select-none', className)}
        />
      </>
    );
  }

  return (
    <Image
      src="/brand/pulse-wordmark-dark.svg"
      alt="Pulse"
      width={width}
      height={Math.round((width / 208) * 56)}
      priority
      unoptimized
      className={cn('select-none', className)}
    />
  );
}

export function Logomark({
  className,
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/pulse-logomark.svg"
      alt="Pulse"
      width={size}
      height={size}
      unoptimized
      className={cn('select-none', className)}
    />
  );
}
