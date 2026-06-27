import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { QuestionsService } from '../questions.service';

/**
 * Sprint 4 acceptance criteria:
 *   - one-vote-per-anonId enforcement (upvotes cannot be repeated)
 *   - question creation defaults / moderation status plumbing
 */
describe('QuestionsService', () => {
  const questionId = new Types.ObjectId().toString();
  const eventId = new Types.ObjectId().toString();

  let findOneAndUpdate: jest.Mock;
  let findById: jest.Mock;
  let findByIdAndUpdate: jest.Mock;
  let create: jest.Mock;
  let find: jest.Mock;
  let service: QuestionsService;

  beforeEach(() => {
    findOneAndUpdate = jest.fn();
    findById = jest.fn();
    findByIdAndUpdate = jest.fn();
    create = jest.fn();
    find = jest.fn();

    const model = {
      findOneAndUpdate,
      findById,
      findByIdAndUpdate,
      create,
      find,
    } as any;

    service = new QuestionsService(model);
  });

  describe('addVote — one vote per anonId', () => {
    it('counts the first vote (filtered by voterAnonIds $ne) and increments', async () => {
      const updated = { _id: questionId, voteCount: 1, voterAnonIds: ['a'] };
      findOneAndUpdate.mockReturnValue({ exec: async () => updated });

      const result = await service.addVote(questionId, 'a');

      expect(result).toBe(updated);
      const [filter, update] = findOneAndUpdate.mock.calls[0];
      // The $ne guard is what makes the vote idempotent per anonId.
      expect(filter.voterAnonIds).toEqual({ $ne: 'a' });
      expect(update.$addToSet).toEqual({ voterAnonIds: 'a' });
      expect(update.$inc).toEqual({ voteCount: 1 });
    });

    it('does NOT increment again when the same anonId votes twice', async () => {
      // Second vote: the $ne filter excludes the doc, so findOneAndUpdate
      // returns null and the service returns the existing (unchanged) doc.
      const existing = { _id: questionId, voteCount: 1, voterAnonIds: ['a'] };
      findOneAndUpdate.mockReturnValue({ exec: async () => null });
      findById.mockReturnValue({ exec: async () => existing });

      const result = await service.addVote(questionId, 'a');

      expect(result).toBe(existing);
      expect(result.voteCount).toBe(1); // still 1, not 2
      expect(findById).toHaveBeenCalledTimes(1);
    });

    it('throws NotFound when the question does not exist at all', async () => {
      findOneAndUpdate.mockReturnValue({ exec: async () => null });
      findById.mockReturnValue({ exec: async () => null });

      await expect(service.addVote(questionId, 'a')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects an invalid questionId', async () => {
      await expect(service.addVote('not-an-id', 'a')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('create', () => {
    it('defaults status to pending and trims input', async () => {
      create.mockImplementation(async (doc) => doc);

      const result = await service.create({
        eventId,
        text: '  How does this work?  ',
        authorAnonId: '  anon-1  ',
        authorName: '  Sam  ',
      });

      expect(result.status).toBe('pending');
      expect(result.text).toBe('How does this work?');
      expect(result.authorAnonId).toBe('anon-1');
      expect(result.authorName).toBe('Sam');
      expect(result.voteCount).toBe(0);
      expect(result.voterAnonIds).toEqual([]);
      expect(result.answerText).toBeNull();
      expect(result.answeredAt).toBeNull();
    });

    it('honours an explicit status (e.g. approved when moderation is off)', async () => {
      create.mockImplementation(async (doc) => doc);

      const result = await service.create({
        eventId,
        text: 'No moderation',
        authorAnonId: 'anon-1',
        status: 'approved',
      });

      expect(result.status).toBe('approved');
    });

    it('rejects empty text', async () => {
      await expect(
        service.create({ eventId, text: '   ', authorAnonId: 'anon-1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('updates to an allowed status', async () => {
      const updated = { _id: questionId, status: 'approved' };
      findByIdAndUpdate.mockReturnValue({ exec: async () => updated });

      const result = await service.updateStatus(questionId, 'approved');

      expect(result).toBe(updated);
      const [, update] = findByIdAndUpdate.mock.calls[0];
      expect(update.$set).toEqual({ status: 'approved' });
    });

    it('rejects an invalid status', async () => {
      await expect(service.updateStatus(questionId, 'bogus' as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('findApprovedByEvent', () => {
    it('includes answered questions in the public Q&A list', async () => {
      const sort = jest.fn().mockReturnValue({ exec: async () => [] });
      find.mockReturnValue({ sort });

      await service.findApprovedByEvent(eventId);

      expect(find).toHaveBeenCalledWith({
        eventId: new Types.ObjectId(eventId),
        status: { $in: ['approved', 'answered'] },
      });
    });
  });

  describe('reply', () => {
    it('stores a sanitized answer and marks the question answered', async () => {
      const updated = {
        _id: questionId,
        answerText: 'Helpful answer',
        status: 'answered',
      };
      findByIdAndUpdate.mockReturnValue({ exec: async () => updated });

      const result = await service.reply(questionId, '  Helpful answer  ');

      expect(result).toBe(updated);
      const [, update, options] = findByIdAndUpdate.mock.calls[0];
      expect(update.$set.answerText).toBe('Helpful answer');
      expect(update.$set.status).toBe('answered');
      expect(update.$set.answeredAt).toBeInstanceOf(Date);
      expect(options).toEqual({ new: true, runValidators: true });
    });

    it('rejects empty answers', async () => {
      await expect(service.reply(questionId, '   ')).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
