import { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicApiFetch } from '@/lib/events-api';

interface SaveAnswerPayload {
  eventId: string;
  activityId: string;
  participantAnonId: string;
  questionId: string;
  selectedOptionIds?: string[];
  textValue?: string;
  ratingValue?: number;
}

export function useSurveySession(eventId: string, activityId: string, participantAnonId: string | null) {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'offline'>('idle');
  const [isCompleted, setIsCompleted] = useState(false);
  const saveQueue = useRef<Map<string, SaveAnswerPayload>>(new Map());
  const isSaving = useRef(false);

  // 1. Fetch or start session
  const { data: session, isLoading: isLoadingSession, error: sessionError } = useQuery({
    queryKey: ['survey-session', activityId, participantAnonId],
    queryFn: async () => {
      if (!participantAnonId) return null;
      try {
        // Try getting the session first
        const existingSession = await publicApiFetch<any>(`events/${eventId}/activities/${activityId}/survey/session/${participantAnonId}`);
        if (existingSession) {
          return existingSession;
        }
        // If not found (backend returned null), start it
        return await publicApiFetch<any>(`events/${eventId}/activities/${activityId}/survey/session`, {
          method: 'POST',
          body: JSON.stringify({ participantAnonId }),
        });
      } catch (err: any) {
        if (err?.status === 404 || err?.message?.includes('not found')) {
          // Fallback if backend still throws 404 (e.g. cached response)
          return await publicApiFetch<any>(`events/${eventId}/activities/${activityId}/survey/session`, {
            method: 'POST',
            body: JSON.stringify({ participantAnonId }),
          });
        }
        throw err;
      }
    },
    enabled: Boolean(participantAnonId && eventId && activityId),
    retry: 3,
  });

  // Track completion state from session
  useEffect(() => {
    if (session?.status === 'completed') {
      setIsCompleted(true);
    }
  }, [session?.status]);

  // Handle network resilience and offline state
  useEffect(() => {
    const handleOnline = () => {
      setSaveStatus(saveQueue.current.size > 0 ? 'saving' : 'saved');
      processQueue();
    };
    const handleOffline = () => setSaveStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (payload: SaveAnswerPayload) => {
      return publicApiFetch(`events/${eventId}/activities/${activityId}/survey/answer`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => setSaveStatus('saved'),
    onError: () => setSaveStatus('error'),
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      return publicApiFetch(`events/${eventId}/activities/${activityId}/survey/complete`, {
        method: 'POST',
        body: JSON.stringify({ eventId, activityId, participantAnonId }),
      });
    },
    onSuccess: () => {
      setIsCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['survey-session', activityId, participantAnonId] });
    },
  });

  const processQueue = useCallback(async () => {
    if (isSaving.current || saveQueue.current.size === 0 || !navigator.onLine) return;

    isSaving.current = true;
    setSaveStatus('saving');

    const entries = Array.from(saveQueue.current.entries());
    saveQueue.current.clear();

    try {
      await Promise.all(entries.map(([_, payload]) => saveMutation.mutateAsync(payload)));
      if (saveQueue.current.size === 0) {
        setSaveStatus('saved');
      }
    } catch (err) {
      setSaveStatus('error');
      // Re-queue failed items (simple retry logic)
      entries.forEach(([key, payload]) => {
        if (!saveQueue.current.has(key)) {
          saveQueue.current.set(key, payload);
        }
      });
    } finally {
      isSaving.current = false;
      if (saveQueue.current.size > 0 && navigator.onLine) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(processQueue, 2000); // Backoff for retries
      }
    }
  }, [saveMutation]);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced save queue
  const saveAnswer = useCallback((questionId: string, answer: Partial<SaveAnswerPayload>) => {
    if (!participantAnonId || isCompleted) return;

    const payload: SaveAnswerPayload = {
      eventId,
      activityId,
      participantAnonId,
      questionId,
      selectedOptionIds: answer.selectedOptionIds,
      textValue: answer.textValue,
      ratingValue: answer.ratingValue,
    };

    saveQueue.current.set(questionId, payload);
    setSaveStatus('saving');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    // Proper debounce: wait 1 second after last keystroke before saving
    debounceTimer.current = setTimeout(processQueue, 1000);
  }, [eventId, activityId, participantAnonId, isCompleted, processQueue]);

  const completeSession = useCallback(() => {
    if (!participantAnonId || isCompleted) return;
    completeMutation.mutate();
  }, [completeMutation, participantAnonId, isCompleted]);

  return {
    session,
    isLoadingSession,
    sessionError,
    saveAnswer,
    completeSession,
    saveStatus,
    isCompleted,
    isCompleting: completeMutation.isPending,
  };
}
