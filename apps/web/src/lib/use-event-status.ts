import * as React from 'react';
import type { Event } from '@iep/types';
import { getComputedEventStatus, getNextStateChange, type ComputedEventState } from './event-status';

export function useScheduledEventStatus(event: Event | undefined | null) {
  // Start with the exact computed status for right now
  const [computedState, setComputedState] = React.useState<ComputedEventState>(() =>
    getComputedEventStatus(event, new Date())
  );

  React.useEffect(() => {
    if (!event) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    function evaluateAndSchedule() {
      const now = new Date();
      const newState = getComputedEventStatus(event, now);
      
      // Update state if anything (status, countdown string) changed
      setComputedState((prev) => {
        if (
          prev.status !== newState.status ||
          prev.countdown !== newState.countdown ||
          prev.scheduled !== newState.scheduled
        ) {
          return newState;
        }
        return prev;
      });

      // Schedule the next precise evaluation for UI string updates
      const nextUpdate = getNextStateChange(event, now);
      if (nextUpdate) {
        // Calculate delay in ms until nextUpdate. Add 50ms buffer to guarantee we crossed the threshold.
        const delay = Math.max(0, nextUpdate.getTime() - Date.now()) + 50;
        timeoutId = setTimeout(evaluateAndSchedule, delay);
      }
    }

    // Run the first evaluation
    evaluateAndSchedule();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [event]);

  return computedState;
}
