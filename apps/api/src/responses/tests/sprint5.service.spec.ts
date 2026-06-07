import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ResponseService } from '../response.service';

/**
 * Sprint 5 acceptance criteria:
 *   - quiz scoring + late-answer rejection
 *   - word-cloud frequency aggregation (duplicates increase weight, not entries)
 *   - feedback persistence
 *
 * The service is unit-tested against a mocked Mongoose model so we assert the
 * write/read shapes (filters, $set payloads, aggregation pipeline) without a DB.
 */

const activityId = new Types.ObjectId().toString();
const eventId = new Types.ObjectId().toString();
const anonId = 'anon-1';

const quizActivity = {
  config: {
    questions: [
      {
        id: 'q1',
        text: 'What is 2 + 2?',
        options: [
          { id: 'a', label: '3' },
          { id: 'b', label: '4' },
        ],
        correctOptionId: 'b',
        points: 100,
        timeLimitSec: 20,
      },
    ],
  },
} as any;

const wordCloudActivity = {
  config: { prompt: 'One word for today', maxWordsPerParticipant: 3 },
} as any;

const feedbackActivity = {
  config: {
    prompt: 'How was it?',
    fields: [
      { id: 'f1', type: 'rating', label: 'Rate the session' },
      { id: 'f2', type: 'text', label: 'Any comments?' },
    ],
  },
} as any;

describe('ResponseService — quiz scoring + late-answer rejection', () => {
  let findOne: jest.Mock;
  let create: jest.Mock;
  let service: ResponseService;

  const now = 1_000_000;
  const endsAt = now + 20_000;

  beforeEach(() => {
    findOne = jest.fn().mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });
    create = jest.fn().mockImplementation((doc) => Promise.resolve(doc));

    const model = { findOne, create } as any;
    service = new ResponseService(model, {} as any);
  });

  it('marks a correct answer and awards the question points', async () => {
    const saved = await service.saveQuizAnswer(quizActivity, {
      activityId,
      eventId,
      participantAnonId: anonId,
      questionId: 'q1',
      optionId: 'b',
      endsAt,
      answeredAt: now,
    });

    expect(saved.isCorrect).toBe(true);
    expect(saved.awardedPoints).toBe(100);
    expect(saved.quizQuestionId).toBe('q1');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('marks a wrong answer incorrect and awards 0 points', async () => {
    const saved = await service.saveQuizAnswer(quizActivity, {
      activityId,
      eventId,
      participantAnonId: anonId,
      questionId: 'q1',
      optionId: 'a',
      endsAt,
      answeredAt: now,
    });

    expect(saved.isCorrect).toBe(false);
    expect(saved.awardedPoints).toBe(0);
  });

  it('rejects an answer submitted after the deadline (no write)', async () => {
    await expect(
      service.saveQuizAnswer(quizActivity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        questionId: 'q1',
        optionId: 'b',
        endsAt,
        answeredAt: endsAt + 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a second answer to the same question by the same participant', async () => {
    findOne.mockReturnValueOnce({
      lean: () => ({ exec: jest.fn().mockResolvedValue({ _id: 'existing' }) }),
    });

    await expect(
      service.saveQuizAnswer(quizActivity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        questionId: 'q1',
        optionId: 'b',
        endsAt,
        answeredAt: now,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(create).not.toHaveBeenCalled();
  });

  it('rejects an unknown option id', async () => {
    await expect(
      service.saveQuizAnswer(quizActivity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        questionId: 'q1',
        optionId: 'does-not-exist',
        endsAt,
        answeredAt: now,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('ResponseService — word cloud aggregation & submission', () => {
  let findOneAndUpdate: jest.Mock;
  let aggregate: jest.Mock;
  let service: ResponseService;

  beforeEach(() => {
    findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'r1' }),
    });
    aggregate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ text: 'growth', weight: 3 }]),
    });

    const model = { findOneAndUpdate, aggregate } as any;
    service = new ResponseService(model, {} as any);
  });

  it('normalizes words (trim + lowercase) before storing', async () => {
    await service.saveWordCloudResponse(wordCloudActivity, {
      activityId,
      eventId,
      participantAnonId: anonId,
      words: ['  Growth ', 'TEAMWORK'],
    });

    const [, update, options] = findOneAndUpdate.mock.calls.at(-1)!;
    expect(update.$set.words).toEqual(['growth', 'teamwork']);
    expect(options).toMatchObject({ upsert: true });
  });

  it('rejects a submission exceeding maxWordsPerParticipant', async () => {
    await expect(
      service.saveWordCloudResponse(wordCloudActivity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        words: ['one', 'two', 'three', 'four'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects a submission with no valid words', async () => {
    await expect(
      service.saveWordCloudResponse(wordCloudActivity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        words: ['   ', ''],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('aggregates by word frequency so duplicates increase weight, not entries', async () => {
    await service.computeWordCloud(activityId);

    const [pipeline] = aggregate.mock.calls.at(-1)!;
    const group = pipeline.find(
      (stage: Record<string, unknown>) => '$group' in stage,
    );

    // Group keys on the word and sums one per occurrence => weight == frequency.
    expect(group.$group._id).toBe('$words');
    expect(group.$group.weight).toEqual({ $sum: 1 });
  });
});

describe('ResponseService — feedback persistence', () => {
  let findOneAndUpdate: jest.Mock;
  let service: ResponseService;

  beforeEach(() => {
    findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'r1' }),
    });
    const model = { findOneAndUpdate } as any;
    service = new ResponseService(model, {} as any);
  });

  it('persists normalized feedback answers keyed by field id', async () => {
    await service.saveFeedbackResponse(feedbackActivity, {
      activityId,
      eventId,
      participantAnonId: anonId,
      feedbackAnswers: [
        { fieldId: 'f1', type: 'rating', ratingValue: 5 },
        { fieldId: 'f2', type: 'text', textValue: '  great session  ' },
      ],
    });

    const [filter, update, options] = findOneAndUpdate.mock.calls.at(-1)!;
    expect(filter.participantAnonId).toBe(anonId);
    expect(options).toMatchObject({ upsert: true });
    expect(update.$set.feedbackAnswers).toEqual([
      { fieldId: 'f1', type: 'rating', ratingValue: 5, textValue: null },
      { fieldId: 'f2', type: 'text', ratingValue: null, textValue: 'great session' },
    ]);
  });

  it('rejects an answer for an unknown field id', async () => {
    await expect(
      service.saveFeedbackResponse(feedbackActivity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        feedbackAnswers: [{ fieldId: 'nope', type: 'text', textValue: 'hi' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects a duplicate answer for the same field id', async () => {
    await expect(
      service.saveFeedbackResponse(feedbackActivity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        feedbackAnswers: [
          { fieldId: 'f2', type: 'text', textValue: 'one' },
          { fieldId: 'f2', type: 'text', textValue: 'two' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a rating field missing its ratingValue', async () => {
    await expect(
      service.saveFeedbackResponse(feedbackActivity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        feedbackAnswers: [{ fieldId: 'f1', type: 'rating' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a text field with an empty value', async () => {
    await expect(
      service.saveFeedbackResponse(feedbackActivity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        feedbackAnswers: [{ fieldId: 'f2', type: 'text', textValue: '   ' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
