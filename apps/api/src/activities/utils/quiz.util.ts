export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  points: number;
  timeLimitSec: number;
}

export interface QuizConfig {
  questions: QuizQuestion[];
  speedBonusEnabled?: boolean;
}

export function getQuizQuestion(
  config: QuizConfig,
  questionId: string,
): QuizQuestion | undefined {
  return config.questions.find((question) => question.id === questionId);
}

export function sanitizeQuizQuestionForBroadcast(question: QuizQuestion) {
  return {
    questionId: question.id,
    text: question.text,
    options: question.options,
  };
}

export function computeQuizPoints(params: {
  question: QuizQuestion;
  isCorrect: boolean;
  endsAt: number;
  now: number;
  speedBonusEnabled?: boolean;
}): number {
  const { question, isCorrect, endsAt, now, speedBonusEnabled = false } = params;

  if (!isCorrect) return 0;

  const basePoints = question.points;
  if (!speedBonusEnabled) return basePoints;

  const totalMs = question.timeLimitSec * 1000;
  const remainingMs = Math.max(0, endsAt - now);
  const bonusRatio = totalMs > 0 ? remainingMs / totalMs : 0;
  const bonusPoints = Math.round(basePoints * 0.5 * bonusRatio);

  return basePoints + bonusPoints;
}