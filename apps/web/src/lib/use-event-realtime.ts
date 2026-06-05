'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClientEvents, ServerEvents } from '@iep/types';

import { socket } from './socket';
import { apiFetch } from './events-api';
import { getAnonId, getDisplayName } from './anon-id';

export type QaQuestion = {
  _id: string;
  text: string;
  authorName?: string | null;
  voteCount: number;
  status: 'pending' | 'approved' | 'answered' | 'dismissed';
  createdAt: string;
};

type SessionSnapshot = {
  activeActivityId: string | null;
  approvedQuestions: QaQuestion[];
};

export type EventRealtime = {
  count: number;
  error: string | null;
  snapshot: SessionSnapshot | null;
  approvedQuestions: QaQuestion[];
  allQuestions: QaQuestion[];
  askQuestion: (payload: {
    text: string;
    displayName?: string;
  }) => void;
  upvoteQuestion: (payload: { questionId: string }) => void;
  moderateQuestion: (payload: {
    questionId: string;
    status: 'approved' | 'dismissed' | 'answered';
  }) => void;
};

function sortApprovedQuestions(questions: QaQuestion[]): QaQuestion[] {
  return [...questions].sort((a, b) => {
    if (b.voteCount !== a.voteCount) {
      return b.voteCount - a.voteCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function sortAllQuestions(questions: QaQuestion[]): QaQuestion[] {
  return [...questions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function upsertQuestion(current: QaQuestion[], incoming: QaQuestion): QaQuestion[] {
  const next = current.filter((question) => question._id !== incoming._id);

  if (incoming.status !== 'dismissed') {
    next.push(incoming);
  }

  return sortAllQuestions(next);
}

/**
 * Merge a batch of server-fresh questions into the current list. Incoming
 * questions overwrite existing ones (they carry the latest vote/status);
 * dismissed questions are dropped. Used for the join snapshot and the host's
 * initial REST load.
 */
function mergeQuestions(
  current: QaQuestion[],
  incoming: QaQuestion[],
): QaQuestion[] {
  const map = new Map(current.map((question) => [question._id, question]));

  for (const question of incoming) {
    if (question.status === 'dismissed') {
      map.delete(question._id);
    } else {
      map.set(question._id, question);
    }
  }

  return sortAllQuestions(Array.from(map.values()));
}

/**
 * Joins (or observes) an event room over the shared socket and exposes the live
 * participant count, last session snapshot, question state, and any server error.
 *
 * - mode 'participant' registers + counts the visitor.
 * - mode 'observe' is read-only for host dashboard / projector, but host clients
 *   still receive host-room Q&A moderation events through the shared observer join.
 * - Re-emits the join/observe on every (re)connect so reconnecting clients
 *   automatically re-sync — the server replies with a fresh count + snapshot.
 */
export function useEventRealtime(
  eventCode: string | undefined,
  mode: 'participant' | 'observe',
  options?: { eventId?: string },
): EventRealtime {
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [allQuestions, setAllQuestions] = useState<QaQuestion[]>([]);

  const eventId = options?.eventId;

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

    const onSnapshot = (payload: SessionSnapshot) => {
      setSnapshot(payload);
      // Merge (don't replace) so the host's REST-loaded pending/answered
      // questions survive a snapshot that only carries approved ones.
      setAllQuestions((current) =>
        mergeQuestions(current, payload.approvedQuestions ?? []),
      );
    };

    const onQaNew = (payload: { question: QaQuestion }) => {
      if (!payload?.question) return;
      setAllQuestions((current) => upsertQuestion(current, payload.question));
    };

    const onQaUpdated = (payload: { question: QaQuestion }) => {
      if (!payload?.question) return;
      setAllQuestions((current) => upsertQuestion(current, payload.question));
    };

    const onError = (payload: { message: string }) =>
      setError(payload?.message ?? 'Something went wrong.');

    socket.on(ServerEvents.PARTICIPANT_COUNT, onCount);
    socket.on(ServerEvents.SESSION_SNAPSHOT, onSnapshot);
    socket.on(ServerEvents.QA_NEW, onQaNew);
    socket.on(ServerEvents.QA_UPDATED, onQaUpdated);
    socket.on(ServerEvents.ERROR, onError);
    socket.on('connect', join);

    socket.connect();
    if (socket.connected) {
      join();
    }

    return () => {
      socket.off(ServerEvents.PARTICIPANT_COUNT, onCount);
      socket.off(ServerEvents.SESSION_SNAPSHOT, onSnapshot);
      socket.off(ServerEvents.QA_NEW, onQaNew);
      socket.off(ServerEvents.QA_UPDATED, onQaUpdated);
      socket.off(ServerEvents.ERROR, onError);
      socket.off('connect', join);
    };
  }, [eventCode, mode]);

  // Host moderation: the join snapshot only carries APPROVED questions, so the
  // host would otherwise never see questions that were pending/answered before
  // they opened (or refreshed) the dashboard. Load the full set via the
  // host-guarded REST endpoint once and merge it with the live stream.
  useEffect(() => {
    if (mode !== 'observe' || !eventId) {
      return;
    }

    let cancelled = false;

    apiFetch<QaQuestion[]>(`events/${eventId}/questions`)
      .then((questions) => {
        if (cancelled) return;
        setAllQuestions((current) => mergeQuestions(current, questions ?? []));
      })
      .catch(() => {
        // Non-fatal: the host still receives live questions over the socket.
      });

    return () => {
      cancelled = true;
    };
  }, [mode, eventId]);

  const approvedQuestions = useMemo(
    () => sortApprovedQuestions(allQuestions.filter((question) => question.status === 'approved')),
    [allQuestions],
  );

  const askQuestion = (payload: { text: string; displayName?: string }) => {
    if (!eventCode || mode !== 'participant') return;

    socket.emit(ClientEvents.QA_ASK, {
      eventCode: eventCode.toUpperCase(),
      anonId: getAnonId(),
      text: payload.text,
      displayName: payload.displayName,
    });
  };

  const upvoteQuestion = (payload: { questionId: string }) => {
    if (!eventCode || mode !== 'participant') return;

    socket.emit(ClientEvents.QA_UPVOTE, {
      questionId: payload.questionId,
      anonId: getAnonId(),
    });
  };

  const moderateQuestion = (payload: {
    questionId: string;
    status: 'approved' | 'dismissed' | 'answered';
  }) => {
    if (!eventCode || mode !== 'observe') return;

    socket.emit(ClientEvents.QA_MODERATE, payload);
  };

  return {
    count,
    error,
    snapshot,
    approvedQuestions,
    allQuestions,
    askQuestion,
    upvoteQuestion,
    moderateQuestion,
  };
}