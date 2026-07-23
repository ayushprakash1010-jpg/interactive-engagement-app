import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, LockKeyhole } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface WorkspaceCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  /** If true, renders a "Coming soon" state — not clickable */
  comingSoon?: boolean;
  /** Optional badge shown on the card (e.g. a live count) */
  badge?: React.ReactNode;
}

/**
 * Workspace card for the Admin Console Launcher.
 * Active cards are clickable links with a hover state.
 * Coming-soon cards are rendered as non-interactive tiles with a lock icon.
 */
export function WorkspaceCard({
  title,
  description,
  icon: Icon,
  href,
  comingSoon = false,
  badge,
}: WorkspaceCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            comingSoon
              ? 'bg-surface-sunken text-ink-muted'
              : 'bg-brand-subtle text-brand',
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge}
          {comingSoon ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-ink-muted">
              <LockKeyhole className="h-2.5 w-2.5" />
              Soon
            </span>
          ) : (
            <ChevronRight className="h-4 w-4 text-ink-muted" />
          )}
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <p
          className={cn(
            'text-sm font-semibold leading-snug',
            comingSoon ? 'text-ink-muted' : 'text-foreground',
          )}
        >
          {title}
        </p>
        <p className="text-xs text-ink-muted leading-relaxed">{description}</p>
      </div>
    </>
  );

  const baseClass = cn(
    'group block rounded-xl border bg-surface-card p-5 shadow-sm transition-all duration-fast ease-standard',
    comingSoon
      ? 'cursor-not-allowed opacity-60'
      : 'hover:border-brand/30 hover:shadow-md hover:bg-surface-raised cursor-pointer',
  );

  if (comingSoon || !href) {
    return <div className={baseClass}>{content}</div>;
  }

  return (
    <Link href={href} className={baseClass}>
      {content}
    </Link>
  );
}
