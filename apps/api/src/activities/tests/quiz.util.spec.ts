import { computeQuizPoints, QuizQuestion } from '../utils/quiz.util';

/**
 * Quiz scoring (Sprint 5 acceptance criteria).
 *
 * computeQuizPoints is the single source of truth for how many points a quiz
 * answer earns. These tests pin down: no points for wrong answers, flat points
 * when the speed bonus is off, and a remaining-time-scaled bonus when it is on.
 */
describe('computeQuizPoints', () => {
  const question: QuizQuestion = {
    id: 'q1',
    text: 'What is 2 + 2?',
    options: [
      { id: 'a', label: '3' },
      { id: 'b', label: '4' },
    ],
    correctOptionId: 'b',
    points: 100,
    timeLimitSec: 20,
  };

  // endsAt is "now + 20s"; answering at `now` means full time remaining.
  const now = 1_000_000;
  const endsAt = now + question.timeLimitSec * 1000;

  it('awards 0 points for an incorrect answer', () => {
    expect(
      computeQuizPoints({ question, isCorrect: false, endsAt, now }),
    ).toBe(0);
  });

  it('awards flat base points for a correct answer when speed bonus is off', () => {
    expect(
      computeQuizPoints({ question, isCorrect: true, endsAt, now }),
    ).toBe(100);
  });

  it('awards base + near-full bonus for an instant correct answer when enabled', () => {
    // Answered at `now` -> ~all time remaining -> bonus ~= 50% of base.
    expect(
      computeQuizPoints({
        question,
        isCorrect: true,
        endsAt,
        now,
        speedBonusEnabled: true,
      }),
    ).toBe(150);
  });

  it('scales the bonus down as time runs out', () => {
    // Half the time elapsed -> bonus ~= 25% of base.
    const halfway = now + (question.timeLimitSec * 1000) / 2;
    expect(
      computeQuizPoints({
        question,
        isCorrect: true,
        endsAt,
        now: halfway,
        speedBonusEnabled: true,
      }),
    ).toBe(125);
  });

  it('gives no bonus (only base) when answered exactly at the deadline', () => {
    expect(
      computeQuizPoints({
        question,
        isCorrect: true,
        endsAt,
        now: endsAt,
        speedBonusEnabled: true,
      }),
    ).toBe(100);
  });
});
