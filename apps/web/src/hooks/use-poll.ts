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

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestionState {
  activityId: string;
  questionId: string;
  text: string;
  options: QuizOption[];
  endsAt: number;
  questionNumber?: number;
}

export interface QuizAnswerState {
  questionId: string;
  selectedOptionId: string;
  isCorrect?: boolean;
  awardedPoints?: number;
}

export interface QuizLeaderboardEntry {
  name: string;
  points: number;
}

export interface WordCloudEntry {
  text: string;
  weight: number;
}

export interface FeedbackField {
  id: string;
  type: 'rating' | 'text';
  label: string;
}

export interface FeedbackConfig {
  prompt: string;
  fields: FeedbackField[];
}

export interface LiveActivity {
  _id: string;
  type: 'poll' | 'quiz' | 'wordcloud' | 'feedback';
  title: string;
  status: 'idle' | 'live' | 'closed';
  config: {
    pollType?: 'single' | 'multiple' | 'rating' | 'open';
    question?: string;
    prompt?: string;
    options?: { id: string; label: string }[];
    ratingScale?: number;
    maxWordsPerParticipant?: number;
    fields?: FeedbackField[];
    timeLimitSec?: number; // <--- ADDED: Strict type support for your new timer
  };
}

export interface FeedbackResponseFieldPayload {
  fieldId: string;
  type: 'rating' | 'text';
  ratingValue?: number;
  textValue?: string;
}

export interface UsePollReturn {
  activeActivity: LiveActivity | null;
  tallies: PollTallyResult | null;
  pollEndsAt: number | null;
  hasSubmitted: boolean;
  quizQuestion: QuizQuestionState | null;
  hasAnsweredQuiz: boolean;
  quizAnswerState: QuizAnswerState | null;
  quizLeaderboard: QuizLeaderboardEntry[];
  wordCloudWords: WordCloudEntry[];
  submittedWordCloudWords: string[];
  submitResponse: (payload: {
    activityId: string;
    selectedOptionIds?: string[];
    textValue?: string;
    ratingValue?: number;
  }) => void;
  submitFeedbackResponse: (payload: {
    activityId: string;
    feedbackAnswers: FeedbackResponseFieldPayload[];
  }) => void;
  submitQuizAnswer: (payload: {
    activityId: string;
    questionId: string;
    optionId: string;
    clientTimeMs: number;
  }) => void;
  submitWordCloudWords: (payload: {
    activityId: string;
    words: string[];
  }) => void;
  resetSubmission: () => void;
}

type SessionSnapshotPayload = {
  activeActivity: LiveActivity | null;
  currentTally: PollTallyResult | null;
  currentQuizQuestion?: {
    activityId?: string;
    questionId: string;
    text?: string;
    options: QuizOption[];
    endsAt: string | number;
    questionNumber?: number;
    questionIndex?: number;
  } | null;
  currentQuizLeaderboard?: QuizLeaderboardEntry[] | null;
  currentWordCloud?: {
    activityId?: string;
    words?: Array<{ text?: string; value?: number; weight?: number }>;
  } | null;
  pollEndsAt?: number | null;
};

type WordCloudUpdatePayload = {
  activityId?: string;
  words?: Array<{ text?: string; value?: number; weight?: number }>;
};

function normalizeWordCloudEntries(
  words?: Array<{ text?: string; value?: number; weight?: number }>,
): WordCloudEntry[] {
  return (words ?? [])
    .map((entry) => ({
      text: (entry.text ?? '').trim(),
      weight: typeof entry.weight === 'number' ? entry.weight : entry.value ?? 0,
    }))
    .filter((entry) => entry.text.length > 0 && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);
}

function normalizeQuizLeaderboard(
  entries?: Array<
    QuizLeaderboardEntry | { topname?: string; name?: string; points: number }
  > | null,
): QuizLeaderboardEntry[] {
  return (entries ?? []).map((entry) => ({
    name: ('name' in entry ? entry.name : entry.topname) ?? 'Anonymous',
    points: entry.points,
  }));
}

export function usePoll(anonId: string | null): UsePollReturn {
  const [activeActivity, setActiveActivity] = useState<LiveActivity | null>(null);
  const [tallies, setTallies] = useState<PollTallyResult | null>(null);
  const [pollEndsAt, setPollEndsAt] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestionState | null>(null);
  const [hasAnsweredQuiz, setHasAnsweredQuiz] = useState(false);
  const [quizAnswerState, setQuizAnswerState] = useState<QuizAnswerState | null>(null);
  const [quizLeaderboard, setQuizLeaderboard] = useState<QuizLeaderboardEntry[]>([]);
  const [wordCloudWords, setWordCloudWords] = useState<WordCloudEntry[]>([]);
  const [submittedWordCloudWords, setSubmittedWordCloudWords] = useState<string[]>([]);

  const submittedRef = useRef(false);
  const answeredQuestionIdRef = useRef<string | null>(null);
  const lastQuizActivityIdRef = useRef<string | null>(null);
  const activeActivityIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeActivityIdRef.current = activeActivity?._id ?? null;
  }, [activeActivity?._id]);

  useEffect(() => {
    const onActivityLaunched = (data: { activity: LiveActivity; endsAt?: number }) => {
      setActiveActivity(data.activity);
      setPollEndsAt(data.endsAt ?? null);
      setTallies(null);
      setHasSubmitted(false);
      setQuizQuestion(null);
      setHasAnsweredQuiz(false);
      setQuizAnswerState(null);
      setQuizLeaderboard([]);
      setWordCloudWords([]);
      setSubmittedWordCloudWords([]);
      submittedRef.current = false;
      answeredQuestionIdRef.current = null;
      lastQuizActivityIdRef.current =
        data.activity.type === 'quiz' ? data.activity._id : null;
      activeActivityIdRef.current = data.activity._id;
    };

    const onActivityClosed = (data: { activityId: string }) => {
      setActiveActivity((prev) =>
        prev?._id === data.activityId ? { ...prev, status: 'closed' } : prev,
      );

      setQuizQuestion((prev) => {
        if (prev?.activityId === data.activityId) {
          answeredQuestionIdRef.current = null;
          setHasAnsweredQuiz(false);
          setQuizAnswerState(null);
          return null;
        }
        return prev;
      });

      if (activeActivityIdRef.current === data.activityId) {
        activeActivityIdRef.current = data.activityId;
        setPollEndsAt(null);
      }
    };

    const onPollResults = (data: {
      activityId: string;
      tallies: PollTallyResult;
    }) => {
      if (activeActivityIdRef.current === data.activityId) {
        setTallies(data.tallies);
      }
    };

    const onQuizQuestion = (data: {
      activityId?: string;
      questionId: string;
      text?: string;
      options: QuizOption[];
      endsAt: string | number;
      questionNumber?: number;
      questionIndex?: number;
    }) => {
      const activityId =
        data.activityId ??
        lastQuizActivityIdRef.current ??
        activeActivityIdRef.current ??
        '';

      if (!activityId) return;

      lastQuizActivityIdRef.current = activityId;

      const nextQuestionId = data.questionId;
      const nextEndsAt = Number(data.endsAt);

      setQuizQuestion((prev) => {
        const isNewQuestion = prev?.questionId !== nextQuestionId;

        if (isNewQuestion) {
          setHasAnsweredQuiz(false);
          setQuizAnswerState(null);
          setQuizLeaderboard([]);
          answeredQuestionIdRef.current = null;
        }

        return {
          activityId,
          questionId: nextQuestionId,
          text: data.text ?? '',
          options: data.options ?? [],
          endsAt: Number.isFinite(nextEndsAt) ? nextEndsAt : 0,
          questionNumber: data.questionNumber ?? data.questionIndex,
        };
      });
    };

    const onQuizLeaderboard = (data: {
      top?: Array<
        | QuizLeaderboardEntry
        | { topname?: string; name?: string; points: number }
      >;
    }) => {
      setQuizLeaderboard(normalizeQuizLeaderboard(data.top));
    };

    const onWordCloudUpdate = (data: WordCloudUpdatePayload) => {
      const activityId = data.activityId ?? activeActivityIdRef.current;

      if (!activityId || activeActivityIdRef.current !== activityId) {
        return;
      }

      setWordCloudWords(normalizeWordCloudEntries(data.words));
    };

    const onSessionSnapshot = (data: SessionSnapshotPayload) => {
      setActiveActivity(data.activeActivity);
      setTallies(data.currentTally);
      setPollEndsAt(data.pollEndsAt ?? null);
      setQuizLeaderboard(normalizeQuizLeaderboard(data.currentQuizLeaderboard));
      setWordCloudWords(normalizeWordCloudEntries(data.currentWordCloud?.words));

      activeActivityIdRef.current = data.activeActivity?._id ?? null;

      const active = data.activeActivity;
      const currentQuiz = data.currentQuizQuestion;

      if (active?.type === 'quiz') {
        lastQuizActivityIdRef.current = active._id;
      } else {
        lastQuizActivityIdRef.current = null;
        answeredQuestionIdRef.current = null;
        setHasAnsweredQuiz(false);
        setQuizAnswerState(null);
      }

      if (active?.type === 'quiz' && currentQuiz) {
        const nextQuestionId = currentQuiz.questionId;
        const nextEndsAt = Number(currentQuiz.endsAt);

        setQuizQuestion((prev) => {
          const isNewQuestion = prev?.questionId !== nextQuestionId;

          if (isNewQuestion) {
            answeredQuestionIdRef.current = null;
            setHasAnsweredQuiz(false);
            setQuizAnswerState(null);
          }

          return {
            activityId: currentQuiz.activityId ?? active._id,
            questionId: nextQuestionId,
            text: currentQuiz.text ?? '',
            options: currentQuiz.options ?? [],
            endsAt: Number.isFinite(nextEndsAt) ? nextEndsAt : 0,
            questionNumber:
              currentQuiz.questionNumber ?? currentQuiz.questionIndex,
          };
        });
      } else {
        setQuizQuestion(null);
      }
    };

    const onResponded = (data?: {
      activityId?: string;
      questionId?: string;
      isCorrect?: boolean;
      awardedPoints?: number;
    }) => {
      if (data?.questionId) {
        setHasAnsweredQuiz(true);
        answeredQuestionIdRef.current = data.questionId;

        setQuizAnswerState((prev) => {
          const previousQuestionId = prev?.questionId ?? '';
          const previousSelectedOptionId = prev?.selectedOptionId ?? '';

          return {
            questionId: data.questionId ?? previousQuestionId,
            selectedOptionId:
              previousQuestionId === data.questionId ? previousSelectedOptionId : '',
            isCorrect: data.isCorrect,
            awardedPoints: data.awardedPoints,
          };
        });

        return;
      }

      setHasSubmitted(true);
      submittedRef.current = true;
    };

    socket.on(ServerEvents.ACTIVITY_LAUNCHED, onActivityLaunched);
    socket.on(ServerEvents.ACTIVITY_CLOSED, onActivityClosed);
    socket.on(ServerEvents.POLL_RESULTS, onPollResults);
    socket.on(ServerEvents.QUIZ_QUESTION, onQuizQuestion);
    socket.on(ServerEvents.QUIZ_LEADERBOARD, onQuizLeaderboard);
    socket.on(ServerEvents.WORDCLOUD_UPDATE, onWordCloudUpdate);
    socket.on(ServerEvents.SESSION_SNAPSHOT, onSessionSnapshot);
    socket.on(ServerEvents.ACTIVITY_RESPONDED, onResponded);

    return () => {
      socket.off(ServerEvents.ACTIVITY_LAUNCHED, onActivityLaunched);
      socket.off(ServerEvents.ACTIVITY_CLOSED, onActivityClosed);
      socket.off(ServerEvents.POLL_RESULTS, onPollResults);
      socket.off(ServerEvents.QUIZ_QUESTION, onQuizQuestion);
      socket.off(ServerEvents.QUIZ_LEADERBOARD, onQuizLeaderboard);
      socket.off(ServerEvents.WORDCLOUD_UPDATE, onWordCloudUpdate);
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

  const submitFeedbackResponse = useCallback(
    (payload: {
      activityId: string;
      feedbackAnswers: FeedbackResponseFieldPayload[];
    }) => {
      if (submittedRef.current || !anonId) return;

      socket.emit(ClientEvents.ACTIVITY_RESPOND, {
        activityId: payload.activityId,
        anonId,
        feedbackAnswers: payload.feedbackAnswers,
      });

      setHasSubmitted(true);
      submittedRef.current = true;
    },
    [anonId],
  );

  const submitQuizAnswer = useCallback(
    (payload: {
      activityId: string;
      questionId: string;
      optionId: string;
      clientTimeMs: number;
    }) => {
      if (!anonId) return;
      if (answeredQuestionIdRef.current === payload.questionId) return;

      socket.emit(ClientEvents.QUIZ_ANSWER, { ...payload, anonId });

      setHasAnsweredQuiz(true);
      setQuizAnswerState({
        questionId: payload.questionId,
        selectedOptionId: payload.optionId,
      });
      answeredQuestionIdRef.current = payload.questionId;
    },
    [anonId],
  );

  const submitWordCloudWords = useCallback(
    (payload: {
      activityId: string;
      words: string[];
    }) => {
      if (submittedRef.current || !anonId) return;

      socket.emit(ClientEvents.WORDCLOUD_SUBMIT, {
        activityId: payload.activityId,
        anonId,
        words: payload.words,
      });

      setSubmittedWordCloudWords(payload.words);
      setHasSubmitted(true);
      submittedRef.current = true;
    },
    [anonId],
  );

  const resetSubmission = useCallback(() => {
    setHasSubmitted(false);
    setQuizQuestion(null);
    setHasAnsweredQuiz(false);
    setQuizAnswerState(null);
    setQuizLeaderboard([]);
    setSubmittedWordCloudWords([]);
    submittedRef.current = false;
    answeredQuestionIdRef.current = null;
  }, []);

  return {
    activeActivity,
    tallies,
    pollEndsAt,
    hasSubmitted,
    quizQuestion,
    hasAnsweredQuiz,
    quizAnswerState,
    quizLeaderboard,
    wordCloudWords,
    submittedWordCloudWords,
    submitResponse,
    submitFeedbackResponse,
    submitQuizAnswer,
    submitWordCloudWords,
    resetSubmission,
  };
}