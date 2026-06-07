import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ResponseService } from '../response.service';

/**
 * Duplicate-vote prevention (Sprint 3 acceptance criteria).
 *
 * Enforcement lives in two places:
 *   1. A unique index on { activityId, participantAnonId } (response.schema.ts).
 *   2. saveResponse() always upserting on that same key, so a re-submission by
 *      the same anonId updates the existing doc instead of inserting a second.
 *
 * These tests assert (2): that every poll type keys the write on
 * { activityId, participantAnonId } with upsert:true, which is what makes a
 * second vote idempotent rather than additive.
 */
describe('ResponseService — duplicate-vote prevention', () => {
  const activityId = new Types.ObjectId().toString();
  const eventId = new Types.ObjectId().toString();
  const anonId = 'anon-1';

  let findOneAndUpdate: jest.Mock;
  let service: ResponseService;

  const makeActivity = (pollType: string) =>
    ({ config: { pollType } }) as any;

  beforeEach(() => {
    findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'r1' }),
    });

    const model = { findOneAndUpdate } as any;
    service = new ResponseService(model, {} as any);
  });

  const lastCall = () => findOneAndUpdate.mock.calls.at(-1)!;

  it('upserts a single-choice vote keyed by (activityId, anonId)', async () => {
    await service.saveResponse(makeActivity('single'), {
      activityId,
      eventId,
      participantAnonId: anonId,
      selectedOptionIds: ['opt_0'],
    });

    const [filter, , options] = lastCall();
    expect(filter.participantAnonId).toBe(anonId);
    expect(filter.activityId.toString()).toBe(activityId);
    expect(options).toMatchObject({ upsert: true });
  });

  it('keeps the same upsert key on a re-vote (no second document created)', async () => {
    // First vote
    await service.saveResponse(makeActivity('single'), {
      activityId,
      eventId,
      participantAnonId: anonId,
      selectedOptionIds: ['opt_0'],
    });
    // Same participant votes again
    await service.saveResponse(makeActivity('single'), {
      activityId,
      eventId,
      participantAnonId: anonId,
      selectedOptionIds: ['opt_1'],
    });

    expect(findOneAndUpdate).toHaveBeenCalledTimes(2);
    const [first] = findOneAndUpdate.mock.calls[0];
    const [second] = findOneAndUpdate.mock.calls[1];
    // Identical filter => the second write targets the SAME document.
    expect(second.participantAnonId).toBe(first.participantAnonId);
    expect(second.activityId.toString()).toBe(first.activityId.toString());
  });

  it('rejects a single-choice submission with more than one option', async () => {
    await expect(
      service.saveResponse(makeActivity('single'), {
        activityId,
        eventId,
        participantAnonId: anonId,
        selectedOptionIds: ['opt_0', 'opt_1'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('allows multiple options for a multiple-choice poll', async () => {
    await service.saveResponse(makeActivity('multiple'), {
      activityId,
      eventId,
      participantAnonId: anonId,
      selectedOptionIds: ['opt_0', 'opt_1'],
    });

    const [, update] = lastCall();
    expect(update.$set.selectedOptionIds).toEqual(['opt_0', 'opt_1']);
  });

  it('upserts a rating vote and requires ratingValue', async () => {
    await service.saveResponse(makeActivity('rating'), {
      activityId,
      eventId,
      participantAnonId: anonId,
      ratingValue: 4,
    });
    const [, update, options] = lastCall();
    expect(update.$set.ratingValue).toBe(4);
    expect(options).toMatchObject({ upsert: true });

    await expect(
      service.saveResponse(makeActivity('rating'), {
        activityId,
        eventId,
        participantAnonId: anonId,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('upserts an open-text vote (trimmed) and requires non-empty text', async () => {
    await service.saveResponse(makeActivity('open'), {
      activityId,
      eventId,
      participantAnonId: anonId,
      textValue: '  hello  ',
    });
    const [, update] = lastCall();
    expect(update.$set.textValue).toBe('hello');

    await expect(
      service.saveResponse(makeActivity('open'), {
        activityId,
        eventId,
        participantAnonId: anonId,
        textValue: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
