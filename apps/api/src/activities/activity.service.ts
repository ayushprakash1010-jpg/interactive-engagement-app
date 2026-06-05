// apps/api/src/activities/activity.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityEntity, ActivityDocument } from './activity.schema';
import { EventsService } from '../events/events.service';

export interface CreateActivityDto {
  type: 'poll' | 'quiz' | 'wordcloud' | 'feedback';
  title: string;
  config: Record<string, unknown>;
}

export interface UpdateActivityDto {
  title?: string;
  config?: Record<string, unknown>;
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(ActivityEntity.name)
    private readonly activityModel: Model<ActivityDocument>,
    private readonly eventsService: EventsService,
  ) {}

  async create(
    eventId: string,
    hostId: string,
    dto: CreateActivityDto,
  ): Promise<ActivityDocument> {
    await this.eventsService.findOne(eventId, hostId);

    const lastActivity = await this.activityModel
      .findOne({ eventId: new Types.ObjectId(eventId) })
      .sort({ order: -1 })
      .select('order')
      .lean()
      .exec();

    const order = lastActivity ? (lastActivity as any).order + 1 : 0;

    return this.activityModel.create({
      eventId: new Types.ObjectId(eventId),
      type: dto.type,
      title: dto.title,
      order,
      status: 'idle',
      config: dto.config,
    });
  }

  async findAllByEvent(
    eventId: string,
    hostId: string,
  ): Promise<ActivityDocument[]> {
    await this.eventsService.findOne(eventId, hostId);

    const activities = await this.activityModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ order: 1 })
      .lean()
      .exec();

    return activities as unknown as ActivityDocument[];
  }

  async findOne(id: string, eventId: string): Promise<ActivityDocument> {
    this.assertObjectId(id);

    const activity = (await this.activityModel
      .findOne({
        _id: new Types.ObjectId(id),
        eventId: new Types.ObjectId(eventId),
      })
      .lean()
      .exec()) as unknown as ActivityDocument | null;

    if (!activity) {
      throw new NotFoundException(`Activity ${id} not found`);
    }

    return activity;
  }

  async findById(id: string): Promise<ActivityDocument> {
    this.assertObjectId(id);

    const activity = await this.activityModel.findById(id).exec();

    if (!activity) {
      throw new NotFoundException(`Activity ${id} not found`);
    }

    return activity;
  }

  async update(
    id: string,
    eventId: string,
    hostId: string,
    dto: UpdateActivityDto,
  ): Promise<ActivityDocument> {
    await this.eventsService.findOne(eventId, hostId);

    const activity = await this.findOne(id, eventId);

    if ((activity as any).status === 'live') {
      throw new BadRequestException(
        'Cannot edit a live activity — close it first',
      );
    }

    const doc = await this.activityModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Activity ${id} not found`);

    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.config !== undefined) doc.config = dto.config as any;

    await doc.save();

    return doc;
  }

  async remove(id: string, eventId: string, hostId: string): Promise<void> {
    await this.eventsService.findOne(eventId, hostId);

    const activity = await this.findOne(id, eventId);

    if ((activity as any).status === 'live') {
      throw new BadRequestException(
        'Cannot delete a live activity — close it first',
      );
    }

    await this.activityModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async reorder(
    eventId: string,
    hostId: string,
    orderedIds: string[],
  ): Promise<void> {
    await this.eventsService.findOne(eventId, hostId);

    const writes = orderedIds.map((id, index) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(id),
          eventId: new Types.ObjectId(eventId),
        },
        update: { $set: { order: index } },
      },
    }));

    await this.activityModel.bulkWrite(writes);
  }

  async setStatus(
    id: string,
    status: 'idle' | 'live' | 'closed',
  ): Promise<ActivityDocument> {
    const activity = await this.activityModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .exec();

    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return activity;
  }

  async closeLiveActivity(eventId: string): Promise<ActivityDocument | null> {
    return this.activityModel
      .findOneAndUpdate(
        { eventId: new Types.ObjectId(eventId), status: 'live' },
        { $set: { status: 'closed' } },
        { new: true },
      )
      .exec();
  }

  private assertObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Activity ${id} not found`);
    }
  }
}
