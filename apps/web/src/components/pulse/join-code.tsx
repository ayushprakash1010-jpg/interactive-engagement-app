'use client';

import { Copy, Check } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const sizeMap = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
  xl: 'text-7xl',
} as const;

/**
 * Large mono join code with wide tracking. Optional copy affordance.
 * Use `inverse` on dark / .pulse-stage surfaces.
 */
export function JoinCode({
  code,
  size = 'md',
  copyable = false,
  inverse = false,
  className,
}: {
  code: string;
  size?: keyof typeof sizeMap;
  copyable?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <span
        className={cn(
          'font-mono font-bold tabular-nums tracking-code',
          sizeMap[size],
          inverse ? 'text-ink-on-dark' : 'text-foreground',
        )}
      >
        {code}
      </span>
      {copyable && (
        <button
          type="button"
          onClick={copy}
          aria-label="Copy join code"
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-muted text-ink-muted transition-colors hover:text-foreground"
        >
          {copied ? <Check className="h-[15px] w-[15px]" /> : <Copy className="h-[15px] w-[15px]" />}
        </button>
      )}
    </div>
  );
}
