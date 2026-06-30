"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEvents } from "./use-events";
import { eventKeys } from "./use-events";
import { getComputedEventStatus } from "./event-status";
import { notify } from "./notification-store";
import { eventsApi } from "./events-api";

/**
 * Globally evaluates scheduled events and executes lifecycle transitions.
 * Mounted once in DashboardLayout — runs independently of any page component.
 *
 * Architecture note:
 * - We use a ref to hold the latest events so the timeout callback always
 *   reads fresh data without the effect needing to re-run and cancel timers.
 * - We use a ref Set to track which event IDs have already been mutated in
 *   this session, preventing duplicate PATCH requests on re-evaluation.
 */
export function useGlobalEventScheduler() {
  const { data: events } = useEvents();
  const queryClient = useQueryClient();

  // Always hold the latest events in a ref so setTimeout callbacks read
  // fresh data instead of stale closures.
  const eventsRef = React.useRef(events);
  React.useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Per-session idempotency guards — prevents duplicate mutations.
  const mutatingRef = React.useRef<Set<string>>(new Set()); // currently in-flight
  const warnedSoonRef = React.useRef<Set<string>>(new Set());

  // Single long-lived effect: set up the initial timeout chain once.
  // The timeout callback always reads eventsRef.current (fresh).
  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    function scheduleNext(delayMs: number) {
      if (cancelled) return;
      timeoutId = setTimeout(evaluateAndSchedule, delayMs + 100);
    }

    function evaluateAndSchedule() {
      if (cancelled) return;

      const now = new Date();
      const nowMs = now.getTime();
      const currentEvents = eventsRef.current;
      let nextDelayMs = Infinity;

      if (currentEvents && currentEvents.length > 0) {
        for (const event of currentEvents) {
          if (!event.scheduledStart || !event.scheduledEnd) continue;
          if (event.status === "ended") continue;

          const computed = getComputedEventStatus(event, now);
          const id = event._id;

          // Draft -> Live transition (idempotent: skip if in-flight or DB already live)
          if (
            computed.status === "active" &&
            event.status === "draft" &&
            !mutatingRef.current.has(`live:${id}`)
          ) {
            mutatingRef.current.add(`live:${id}`);
            eventsApi
              .update(id, { status: "live" })
              .then(() => {
                notify({
                  type: "event-scheduled-live",
                  description: `${event.name} is now live!`,
                  href: `/dashboard/events/${id}`,
                });
                // Invalidate both the list and the specific detail query
                void queryClient.invalidateQueries({ queryKey: eventKeys.all });
                void queryClient.invalidateQueries({
                  queryKey: eventKeys.detail(id),
                });
              })
              .catch((err) => {
                console.error(
                  "[Scheduler] Failed to launch scheduled event:",
                  err,
                );
                // Allow retry on failure
                mutatingRef.current.delete(`live:${id}`);
              });
          }

          // Live -> Ended transition (idempotent: skip if already in-flight)
          else if (
            computed.status === "past" &&
            !mutatingRef.current.has(`ended:${id}`)
          ) {
            mutatingRef.current.add(`ended:${id}`);
            eventsApi
              .update(id, { status: "ended" })
              .then(() => {
                notify({
                  type: "event-scheduled-ended",
                  description: `${event.name} has ended.`,
                  href: `/dashboard/events/${id}`,
                });
                void queryClient.invalidateQueries({ queryKey: eventKeys.all });
                void queryClient.invalidateQueries({
                  queryKey: eventKeys.detail(id),
                });
              })
              .catch((err) => {
                console.error(
                  "[Scheduler] Failed to end scheduled event:",
                  err,
                );
                mutatingRef.current.delete(`ended:${id}`);
              });
          }

          // Starts-soon notification (fires once per session)
          if (
            computed.status === "upcoming" &&
            computed.diffMins !== undefined &&
            computed.diffMins <= 30 &&
            !warnedSoonRef.current.has(id)
          ) {
            const warnedSoonStorageKey = `iep:event-starts-soon:${id}`;
            if (
              typeof window !== "undefined" &&
              window.sessionStorage.getItem(warnedSoonStorageKey)
            ) {
              warnedSoonRef.current.add(id);
            } else {
              warnedSoonRef.current.add(id);
              if (typeof window !== "undefined") {
                window.sessionStorage.setItem(warnedSoonStorageKey, "1");
              }
              notify({
                type: "event-starts-soon",
                description: `${event.name} starts in ${computed.diffMins} min.`,
                href: `/dashboard/events/${id}`,
              });
            }
          }

          // Find the closest future boundary for this event
          const startMs = new Date(event.scheduledStart).getTime();
          const endMs = new Date(event.scheduledEnd).getTime();
          const warnMs = startMs - 30 * 60000;

          if (warnMs > nowMs)
            nextDelayMs = Math.min(nextDelayMs, warnMs - nowMs);
          if (startMs > nowMs)
            nextDelayMs = Math.min(nextDelayMs, startMs - nowMs);
          if (endMs > nowMs) nextDelayMs = Math.min(nextDelayMs, endMs - nowMs);
        }
      }

      if (nextDelayMs !== Infinity) {
        scheduleNext(nextDelayMs);
      }
    }

    // Kick off — wait a tick so eventsRef is populated from first render
    const initId = setTimeout(evaluateAndSchedule, 0);

    return () => {
      cancelled = true;
      clearTimeout(initId);
      clearTimeout(timeoutId);
    };
  }, [events, queryClient]);
}
