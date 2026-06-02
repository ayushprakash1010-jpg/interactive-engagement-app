'use client';

import { useEffect, useState } from 'react';
import { ClientEvents, ServerEvents } from '@iep/types';

import { socket } from './socket';
import { getAnonId, getDisplayName } from './anon-id';

type SessionSnapshot = {
  activeActivityId: string | null;
  approvedQuestions: unknown[];
};

export type EventRealtime = {
  count: number;
  error: string | null;
  snapshot: SessionSnapshot | null;
};

/**
 * Joins (or observes) an event room over the shared socket and exposes the live
 * participant count, last session snapshot, and any server error.
 *
 * - mode 'participant' registers + counts the visitor (the live participant
 *   screen). mode 'observe' is read-only for host dashboard / projector.
 * - Re-emits the join/observe on every (re)connect so reconnecting clients
 *   automatically re-sync — the server replies with a fresh count + snapshot.
 */
export function useEventRealtime(
  eventCode: string | undefined,
  mode: 'participant' | 'observe',
): EventRealtime {
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);

  useEffect(() => {
    if (!eventCode) {
      return;
    }

    const code = eventCode.toUpperCase();

    const join = () => {
      setError(null);
      if (mode === 'participant') {
        socket.emit(ClientEvents.EVENT_JOIN, {
          eventCode: code,
          anonId: getAnonId(),
          displayName: getDisplayName() || undefined,
        });
      } else {
        socket.emit(ClientEvents.EVENT_OBSERVE, { eventCode: code });
      }
    };

    const onCount = (payload: { count: number }) => setCount(payload.count);
    const onSnapshot = (payload: SessionSnapshot) => setSnapshot(payload);
    const onError = (payload: { message: string }) =>
      setError(payload?.message ?? 'Something went wrong.');

    socket.on(ServerEvents.PARTICIPANT_COUNT, onCount);
    socket.on(ServerEvents.SESSION_SNAPSHOT, onSnapshot);
    socket.on(ServerEvents.ERROR, onError);
    socket.on('connect', join);

    socket.connect();
    if (socket.connected) {
      join();
    }

    return () => {
      socket.off(ServerEvents.PARTICIPANT_COUNT, onCount);
      socket.off(ServerEvents.SESSION_SNAPSHOT, onSnapshot);
      socket.off(ServerEvents.ERROR, onError);
      socket.off('connect', join);
    };
  }, [eventCode, mode]);

  return { count, error, snapshot };
}
