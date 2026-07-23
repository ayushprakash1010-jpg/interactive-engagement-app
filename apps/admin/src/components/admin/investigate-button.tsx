'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageContext } from '@/lib/copilot-api';

interface InvestigateButtonProps {
  resourceType: PageContext['type'];
  resourceId: string;
  className?: string;
}

/**
 * Sprint 4 — "Investigate with Copilot" button.
 *
 * Rendered on user/event/live-session/ticket detail pages.
 * On click, opens the CopilotPanel (via a custom DOM event) and pre-fills
 * an investigation query so the admin starts with context immediately.
 */
export function InvestigateButton({ resourceType, resourceId, className }: InvestigateButtonProps) {
  const handleClick = () => {
    // Dispatch a custom event that CopilotPanel listens for to open + pre-fill
    window.dispatchEvent(
      new CustomEvent('pulse:investigate', {
        detail: {
          resourceType,
          resourceId,
          prompt: `Investigate this ${resourceType} (ID: ${resourceId}) and surface any anomalies, unusual activity, or issues I should be aware of.`,
        },
      }),
    );
  };

  return (
    <button
      id={`investigate-btn-${resourceType}`}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/5 px-3 py-1.5',
        'text-xs font-medium text-brand transition hover:bg-brand/15 hover:border-brand/50',
        className,
      )}
    >
      <Search className="h-3.5 w-3.5" />
      Investigate with Copilot
    </button>
  );
}
