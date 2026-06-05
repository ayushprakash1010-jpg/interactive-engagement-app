import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  QuestionDocument,
  QuestionEntity,
  QuestionStatus,
} from './question.schema';

type CreateQuestionInput = {
  eventId: string;
  text: string;
  authorAnonId: string;
  authorName?: string | null;
  status?: QuestionStatus;
};

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(QuestionEntity.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async findByEvent(eventId: string) {
    return this.questionModel
      .find({
        eventId: new Types.ObjectId(eventId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findApprovedByEvent(eventId: string) {
    return this.questionModel
      .find({
        eventId: new Types.ObjectId(eventId),
        status: 'approved',
      })
      .sort({ voteCount: -1, createdAt: -1 })
      .exec();
  }

  async create(input: CreateQuestionInput) {
    const { eventId, text, authorAnonId, authorName, status } = input;

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('A valid eventId is required.');
    }

    if (!authorAnonId?.trim()) {
      throw new BadRequestException('authorAnonId is required.');
    }

    if (!text?.trim()) {
      throw new BadRequestException('Question text is required.');
    }

    const question = await this.questionModel.create({
      eventId: new Types.ObjectId(eventId),
      text: text.trim(),
      authorAnonId: authorAnonId.trim(),
      authorName: authorName?.trim() || null,
      voteCount: 0,
      voterAnonIds: [],
      status: status ?? 'pending',
    });

    return question;
  }

  async addVote(questionId: string, anonId: string) {
    if (!questionId || !Types.ObjectId.isValid(questionId)) {
      throw new BadRequestException('A valid questionId is required.');
    }

    if (!anonId?.trim()) {
      throw new BadRequestException('anonId is required.');
    }

    const trimmedAnonId = anonId.trim();

    const updated = await this.questionModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(questionId),
          voterAnonIds: { $ne: trimmedAnonId },
        },
        {
          $addToSet: { voterAnonIds: trimmedAnonId },
          $inc: { voteCount: 1 },
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (updated) {
      return updated;
    }

    const existing = await this.questionModel
      .findById(new Types.ObjectId(questionId))
      .exec();

    if (!existing) {
      throw new NotFoundException('Question not found.');
    }

    return existing;
  }

  async updateStatus(
    questionId: string,
    status: 'approved' | 'dismissed' | 'answered',
  ) {
    if (!questionId || !Types.ObjectId.isValid(questionId)) {
      throw new BadRequestException('A valid questionId is required.');
    }

    if (!['approved', 'dismissed', 'answered'].includes(status)) {
      throw new BadRequestException(
        'status must be approved, dismissed, or answered.',
      );
    }

    const updated = await this.questionModel
      .findByIdAndUpdate(
        new Types.ObjectId(questionId),
        { $set: { status } },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Question not found.');
    }

    return updated;
  }
}