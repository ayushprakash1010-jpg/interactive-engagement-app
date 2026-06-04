import { useEffect, useState, useCallback, useRef } from 'react';
import { ClientEvents, ServerEvents } from '@iep/types';
import { socket } from '@/lib/socket';

export interface PollOptionResult {
  optionId: string;
  label: string;
  count: number;
}

export interface ChoicePollTally {
  pollType: 'single' | 'multiple';
  totalResponses: number;
  buckets: PollOptionResult[];
}

export interface RatingPollTally {
  pollType: 'rating';
  totalResponses: number;
  average: number;
  distribution: Record<string, number>;
}

export interface OpenPollTally {
  pollType: 'open';
  totalResponses: number;
  texts: string[];
}

export type PollTallyResult =
  | ChoicePollTally
  | RatingPollTally
  | OpenPollTally;

export interface LiveActivity {
  _id: string;
  type: 'poll' | 'quiz' | 'wordcloud' | 'feedback';
  title: string;
  status: 'idle' | 'live' | 'closed';
  config: {
    pollType?: 'single' | 'multiple' | 'rating' | 'open';
    question?: string;
    options?: { id: string; label: string }[];
    ratingScale?: number;
  };
}

export interface UsePollReturn {
  activeActivity: LiveActivity | null;
  tallies: PollTallyResult | null;
  hasSubmitted: boolean;
  submitResponse: (payload: {
    activityId: string;
    selectedOptionIds?: string[];
    textValue?: string;
    ratingValue?: number;
  }) => void;
  resetSubmission: () => void;
}

export function usePoll(anonId: string | null): UsePollReturn {
  const [activeActivity, setActiveActivity] = useState<LiveActivity | null>(null);
  const [tallies, setTallies] = useState<PollTallyResult | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const submittedRef = useRef(false);

  useEffect(() => {
    const onActivityLaunched = (data: { activity: LiveActivity }) => {
      console.log('ACTIVITY LAUNCHED RECEIVED', data);
      setActiveActivity(data.activity);
      setTallies(null);
      setHasSubmitted(false);
      submittedRef.current = false;
    };

    const onActivityClosed = (data: { activityId: string }) => {
      setActiveActivity((prev) =>
        prev?._id === data.activityId ? { ...prev, status: 'closed' } : prev,
      );
    };

    const onPollResults = (data: {
      activityId: string;
      tallies: PollTallyResult;
    }) => {
      setActiveActivity((prev) => {
        if (prev?._id === data.activityId) {
          setTallies(data.tallies);
        }
        return prev;
      });
    };

    const onSessionSnapshot = (data: {
      activeActivity: LiveActivity | null;
      currentTally: PollTallyResult | null;
    }) => {
      console.log('SESSION SNAPSHOT RECEIVED', data);
      setActiveActivity(data.activeActivity);
      setTallies(data.currentTally);
    };

    const onResponded = () => {
      setHasSubmitted(true);
      submittedRef.current = true;
    };

    socket.on(ServerEvents.ACTIVITY_LAUNCHED, onActivityLaunched);
    socket.on(ServerEvents.ACTIVITY_CLOSED, onActivityClosed);
    socket.on(ServerEvents.POLL_RESULTS, onPollResults);
    socket.on(ServerEvents.SESSION_SNAPSHOT, onSessionSnapshot);
    socket.on(ServerEvents.ACTIVITY_RESPONDED, onResponded);

    return () => {
      socket.off(ServerEvents.ACTIVITY_LAUNCHED, onActivityLaunched);
      socket.off(ServerEvents.ACTIVITY_CLOSED, onActivityClosed);
      socket.off(ServerEvents.POLL_RESULTS, onPollResults);
      socket.off(ServerEvents.SESSION_SNAPSHOT, onSessionSnapshot);
      socket.off(ServerEvents.ACTIVITY_RESPONDED, onResponded);
    };
  }, []);

  const submitResponse = useCallback(
    (payload: {
      activityId: string;
      selectedOptionIds?: string[];
      textValue?: string;
      ratingValue?: number;
    }) => {
      if (submittedRef.current || !anonId) return;

      socket.emit(ClientEvents.ACTIVITY_RESPOND, { ...payload, anonId });

      setHasSubmitted(true);
      submittedRef.current = true;
    },
    [anonId],
  );

  const resetSubmission = useCallback(() => {
    setHasSubmitted(false);
    submittedRef.current = false;
  }, []);

  return { activeActivity, tallies, hasSubmitted, submitResponse, resetSubmission };
}