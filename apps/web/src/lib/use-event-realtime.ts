'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClientEvents, ServerEvents } from '@iep/types';

import { socket } from './socket';
import { apiFetch } from './events-api';
import { getAnonId, getDisplayName } from './anon-id';
import { notify } from './notification-store';

export type QaQuestion = {
  _id: string;
  text: string;
  answerText?: string | null;
  answeredAt?: string | null;
  authorName?: string | null;
  voteCount: number;
  status: 'pending' | 'approved' | 'answered' | 'dismissed';
  createdAt: string;
};

type SessionSnapshot = {
  activeActivity: unknown | null;
  currentTally: unknown | null;
  currentQuizQuestion?: unknown | null;
  approvedQuestions: QaQuestion[];
  pendingQuestions?: QaQuestion[];
  // FIX: forwarded from event settings so the participant page knows whether
  // to show "Anonymous" labels and suppress the name field in the QA form.
  allowAnonymousQA?: boolean;
};

export type EventRealtime = {
  count: number;
  error: string | null;
  snapshot: SessionSnapshot | null;
  approvedQuestions: QaQuestion[];
  allQuestions: QaQuestion[];
  // Exposed so the participant page can pass it to QaTab.
  allowAnonymousQA: boolean;
  isEndingSession: boolean;
  sessionEnded: boolean;
  sessionEndError: string | null;
  askQuestion: (payload: { text: string; displayName?: string }) => void;
  upvoteQuestion: (payload: { questionId: string }) => void;
  moderateQuestion: (payload: {
    questionId: string;
    status: 'approved' | 'dismissed' | 'answered';
  }) => void;
  replyQuestion: (payload: { questionId: string; answerText: string }) => void;
  endSession: (payload?: { eventId?: string }) => void;
  resetSessionEndState: () => void;
  sendReaction: (emoji: string) => void;
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

function mergeQuestions(current: QaQuestion[], incoming: QaQuestion[]): QaQuestion[] {
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

function getParticipantMilestone(count: number): number | null {
  if ([10, 25, 50].includes(count)) return count;
  if (count >= 100 && count % 100 === 0) return count;
  return null;
}

export function useEventRealtime(
  eventCode: string | undefined,
  mode: 'participant' | 'observe',
  options?: { eventId?: string },
): EventRealtime {
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [allQuestions, setAllQuestions] = useState<QaQuestion[]>([]);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionEndError, setSessionEndError] = useState<string | null>(null);
  const previousCountRef = useRef<number | null>(null);
  const isEndingSessionRef = useRef(false);
  // Default false: when we don't yet know the setting, treat Q&A as non-anonymous
  // to match the default event creation state.
  const [allowAnonymousQA, setAllowAnonymousQA] = useState(false);

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

    const onCount = (payload: { count: number }) => {
      const nextCount = payload.count;
      const previousCount = previousCountRef.current;

      setCount(nextCount);
      previousCountRef.current = nextCount;

      if (mode !== 'observe' || previousCount === null || nextCount <= previousCount) {
        return;
      }

      const milestone = getParticipantMilestone(nextCount);

      if (milestone) {
        notify({
          type: 'participant-milestone',
          description: `${milestone} participants have joined the session.`,
          href: eventId ? `/dashboard/events/${eventId}` : undefined,
        });
        return;
      }

      notify({
        type: 'participant-joined',
        description: 'A new participant joined the session.',
        href: eventId ? `/dashboard/events/${eventId}` : undefined,
      });
    };

    const onSnapshot = (payload: SessionSnapshot) => {
      setSnapshot(payload);

      // FIX: Read allowAnonymousQA from the snapshot and update state.
      // Defaults to true so any missing/undefined value keeps names hidden.
      if (typeof payload.allowAnonymousQA === 'boolean') {
        setAllowAnonymousQA(payload.allowAnonymousQA);
      }

      const allFromSnapshot = [
        ...(payload.approvedQuestions ?? []),
        ...(payload.pendingQuestions ?? []),
      ];
      setAllQuestions((current) => mergeQuestions(current, allFromSnapshot));
    };

    const onQaNew = (payload: { question: QaQuestion }) => {
      if (!payload?.question) return;
      setAllQuestions((current) => upsertQuestion(current, payload.question));
    };

    const onQaUpdated = (payload: { question: QaQuestion }) => {
      if (!payload?.question) return;
      setAllQuestions((current) => upsertQuestion(current, payload.question));
    };

    const onSessionEnded = () => {
      setIsEndingSession(false);
      isEndingSessionRef.current = false;
      setSessionEndError(null);
      setSessionEnded(true);
    };

    const onError = (payload: { message: string }) => {
      const message = payload?.message ?? 'Something went wrong.';
      setError(message);

      if (isEndingSessionRef.current) {
        setIsEndingSession(false);
        isEndingSessionRef.current = false;
        setSessionEndError(message);
      }
    };

    socket.on(ServerEvents.PARTICIPANT_COUNT, onCount);
    socket.on(ServerEvents.SESSION_SNAPSHOT, onSnapshot);
    socket.on(ServerEvents.QA_NEW, onQaNew);
    socket.on(ServerEvents.QA_UPDATED, onQaUpdated);
    socket.on(ServerEvents.SESSION_ENDED, onSessionEnded);
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
      socket.off(ServerEvents.SESSION_ENDED, onSessionEnded);
      socket.off(ServerEvents.ERROR, onError);
      socket.off('connect', join);
    };
  }, [eventCode, mode, eventId]);

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
        // Non-fatal: host still receives live questions over socket.
      });

    return () => {
      cancelled = true;
    };
  }, [mode, eventId]);

  const approvedQuestions = useMemo(
    () => sortApprovedQuestions(allQuestions.filter((question) => question.status === 'approved')),
    [allQuestions],
  );

  const visibleQuestions = useMemo(
    () =>
      sortApprovedQuestions(
        allQuestions.filter((question) => ['approved', 'answered'].includes(question.status)),
      ),
    [allQuestions],
  );

  const askQuestion = (payload: { text: string; displayName?: string }) => {
    if (!eventCode || mode !== 'participant') return;

    socket.emit(ClientEvents.QA_ASK, {
      eventCode: eventCode.toUpperCase(),
      anonId: getAnonId(),
      text: payload.text,
      // When allowAnonymousQA is true the server will strip the name anyway,
      // but also don't send it from the client as a best-effort measure.
      displayName: allowAnonymousQA ? undefined : payload.displayName,
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

  const replyQuestion = (payload: { questionId: string; answerText: string }) => {
    if (!eventCode || mode !== 'observe') return;

    socket.emit(ClientEvents.QA_REPLY, payload);
  };

  const endSession = useCallback(
    (payload?: { eventId?: string }) => {
      if (mode !== 'observe') return;

      const resolvedEventId = payload?.eventId ?? eventId;
      if (!resolvedEventId) {
        setSessionEndError('Missing event id.');
        return;
      }

      setSessionEnded(false);
      setSessionEndError(null);
      setIsEndingSession(true);
      isEndingSessionRef.current = true;

      socket.emit(ClientEvents.SESSION_END, { eventId: resolvedEventId });
    },
    [eventId, mode],
  );

  const resetSessionEndState = useCallback(() => {
    setIsEndingSession(false);
    isEndingSessionRef.current = false;
    setSessionEnded(false);
    setSessionEndError(null);
  }, []);

  const sendReaction = (emoji: string) => {
    if (!eventCode || mode !== 'participant') return;
    socket.emit(ClientEvents.REACTION_SEND, {
      eventCode: eventCode.toUpperCase(),
      anonId: getAnonId(),
      emoji,
    });
  };

  return {
    count,
    error,
    snapshot,
    approvedQuestions: mode === 'participant' ? visibleQuestions : approvedQuestions,
    allQuestions,
    allowAnonymousQA,
    isEndingSession,
    sessionEnded,
    sessionEndError,
    askQuestion,
    upvoteQuestion,
    moderateQuestion,
    replyQuestion,
    endSession,
    resetSessionEndState,
    sendReaction,
  };
}
