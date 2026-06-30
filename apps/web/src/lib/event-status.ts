import type { Event } from '@iep/types';

export type EventComputedStatus = 'draft' | 'live' | 'ended' | 'active' | 'upcoming' | 'past';

export interface ComputedEventState {
  status: EventComputedStatus;
  countdown: string | null;
  scheduled: boolean;
  diffMins?: number;
}

/**
 * Single source of truth for evaluating an event's runtime status.
 * Handles both legacy manual events and automatically scheduled events.
 */
export function getComputedEventStatus(event: Event | undefined | null, now = new Date()): ComputedEventState {
  if (!event) return { status: 'draft', countdown: null, scheduled: false };

  // If the event has scheduling dates, evaluate based on current time
  if (event.scheduledStart && event.scheduledEnd) {
    const start = new Date(event.scheduledStart);
    const end = new Date(event.scheduledEnd);
    
    if (now >= start && now <= end) {
      return { status: 'active', countdown: null, scheduled: true };
    } 
    
    if (now < start) {
      const diffMs = start.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let countdown = '';
      if (diffDays > 0) {
        countdown = `Starts in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        countdown = `Starts in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      } else {
        countdown = `Starts in ${diffMins} min`;
      }

      return { status: 'upcoming', countdown, scheduled: true, diffMins };
    }
    
    // now > end
    return { status: 'past', countdown: null, scheduled: true };
  }

  // Fallback to legacy manual status
  return { status: event.status, countdown: null, scheduled: false };
}

/**
 * Calculates the exact next time a scheduled event's state or UI needs to update.
 * Used to eliminate naive setInterval polling.
 */
export function getNextStateChange(event: Event | undefined | null, now = new Date()): Date | null {
  if (!event || !event.scheduledStart || !event.scheduledEnd) return null;
  
  const start = new Date(event.scheduledStart);
  const end = new Date(event.scheduledEnd);
  
  if (now > end) return null; // Event is completely in the past, no more transitions

  // Transition to Past
  if (now >= start && now <= end) {
    return end;
  }

  // Below this point, now < start (Upcoming)
  const msUntilStart = start.getTime() - now.getTime();
  const minsUntilStart = Math.floor(msUntilStart / 60000);

  // Transition to Active
  if (minsUntilStart < 1) {
    return start;
  }

  // Transition to "Starts in X min" warning
  const startWarning = new Date(start.getTime() - 30 * 60000); // 30 mins before
  if (now < startWarning && minsUntilStart >= 30) {
    // If we're exactly 30 mins away or more, the next major non-UI change is at the 30 min mark
    // Wait, the countdown still needs to update. But let's return the earliest of (next UI update, startWarning).
    // It will be handled below.
  }

  // If we're inside the 60 min window, the countdown string ("Starts in X min") 
  // needs to update every minute.
  if (minsUntilStart < 60) {
    // Next change is at the top of the next minute
    const nextMinute = new Date(now.getTime() + 60000);
    nextMinute.setSeconds(0, 0);
    return nextMinute;
  }

  // If we're inside the 24 hour window, the countdown string ("Starts in X hours")
  // needs to update every hour.
  const hoursUntilStart = Math.floor(minsUntilStart / 60);
  if (hoursUntilStart < 24) {
    // Return the time when the hour count drops by 1
    // e.g., if there are 2 hours and 15 mins left, the string says "Starts in 2 hours".
    // It will drop to "Starts in 1 hour" exactly 15 mins from now.
    const remainderMins = minsUntilStart % 60;
    // Add 1 min extra to safely cross the threshold
    return new Date(now.getTime() + (remainderMins + 1) * 60000);
  }

  // If we're > 24 hours out ("Starts in X days"), update every day.
  const remainderHours = hoursUntilStart % 24;
  return new Date(now.getTime() + (remainderHours + 1) * 60 * 60000);
}
