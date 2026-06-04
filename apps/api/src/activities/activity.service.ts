// apps/api/src/activities/activity.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
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
  private readonly logger = new Logger(ActivityService.name);

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
    console.log('[activities.service] create start', { eventId, hostId, dto });

    await this.eventsService.findOne(eventId, hostId);

    console.log('[activities.service] ownership ok', { eventId, hostId });

    const lastActivity = await this.activityModel
      .findOne({ eventId: new Types.ObjectId(eventId) })
      .sort({ order: -1 })
      .select('order')
      .lean()
      .exec();

    console.log('[activities.service] lastActivity', lastActivity);

    const order = lastActivity ? (lastActivity as any).order + 1 : 0;

    const activity = await this.activityModel.create({
      eventId: new Types.ObjectId(eventId),
      type: dto.type,
      title: dto.title,
      order,
      status: 'idle',
      config: dto.config,
    });

    console.log('[activities.service] created', {
      id: activity._id?.toString(),
      eventId,
      order,
    });

    return activity;
  }

  async findAllByEvent(
    eventId: string,
    hostId: string,
  ): Promise<ActivityDocument[]> {
    console.log('[activities.service] findAllByEvent start', { eventId, hostId });

    await this.eventsService.findOne(eventId, hostId);

    console.log('[activities.service] findAllByEvent ownership ok', {
      eventId,
      hostId,
    });

    const activities = await this.activityModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ order: 1 })
      .lean()
      .exec();

    console.log('[activities.service] findAllByEvent result count', {
      eventId,
      count: activities.length,
    });

    return activities as unknown as ActivityDocument[];
  }

  async findOne(id: string, eventId: string): Promise<ActivityDocument> {
    console.log('[activities.service] findOne start', { id, eventId });

    this.assertObjectId(id);

    const activity = await this.activityModel
      .findOne({
        _id: new Types.ObjectId(id),
        eventId: new Types.ObjectId(eventId),
      })
      .lean()
      .exec() as unknown as ActivityDocument | null;

    console.log('[activities.service] findOne raw result', { id, eventId, activity });

    if (!activity) {
      throw new NotFoundException(`Activity ${id} not found`);
    }

    return activity;
  }

  async findById(id: string): Promise<ActivityDocument> {
    console.log('[activities.service] findById start', { id });

    this.assertObjectId(id);

    const activity = await this.activityModel.findById(id).exec();

    console.log('[activities.service] findById raw result', { id, activity });

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
    console.log('[activities.service] update start', { id, eventId, hostId, dto });

    await this.eventsService.findOne(eventId, hostId);
    console.log('[activities.service] update ownership ok', { id, eventId, hostId });

    const activity = await this.findOne(id, eventId);

    if ((activity as any).status === 'live') {
      throw new BadRequestException(
        'Cannot edit a live activity — close it first',
      );
    }

    const doc = await this.activityModel.findById(id).exec();
    console.log('[activities.service] update loaded doc', { id, found: !!doc });

    if (!doc) throw new NotFoundException(`Activity ${id} not found`);

    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.config !== undefined) doc.config = dto.config as any;

    await doc.save();

    console.log('[activities.service] update saved', { id });

    return doc;
  }

  async remove(id: string, eventId: string, hostId: string): Promise<void> {
    console.log('[activities.service] remove start', { id, eventId, hostId });

    await this.eventsService.findOne(eventId, hostId);
    console.log('[activities.service] remove ownership ok', { id, eventId, hostId });

    const activity = await this.findOne(id, eventId);

    if ((activity as any).status === 'live') {
      throw new BadRequestException(
        'Cannot delete a live activity — close it first',
      );
    }

    await this.activityModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();

    console.log('[activities.service] remove done', { id });
  }

  async reorder(
    eventId: string,
    hostId: string,
    orderedIds: string[],
  ): Promise<void> {
    console.log('[activities.service] reorder start', {
      eventId,
      hostId,
      orderedIds,
    });

    await this.eventsService.findOne(eventId, hostId);
    console.log('[activities.service] reorder ownership ok', { eventId, hostId });

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

    console.log('[activities.service] reorder done', {
      eventId,
      count: orderedIds.length,
    });
  }

  async setStatus(
    id: string,
    status: 'idle' | 'live' | 'closed',
  ): Promise<ActivityDocument> {
    console.log('[activities.service] setStatus start', { id, status });

    const activity = await this.activityModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .exec();

    console.log('[activities.service] setStatus result', {
      id,
      status,
      found: !!activity,
    });

    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return activity;
  }

  async closeLiveActivity(
    eventId: string,
  ): Promise<ActivityDocument | null> {
    console.log('[activities.service] closeLiveActivity start', { eventId });

    const activity = await this.activityModel
      .findOneAndUpdate(
        { eventId: new Types.ObjectId(eventId), status: 'live' },
        { $set: { status: 'closed' } },
        { new: true },
      )
      .exec();

    console.log('[activities.service] closeLiveActivity result', {
      eventId,
      found: !!activity,
    });

    return activity;
  }

  private assertObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      console.log('[activities.service] invalid object id', { id });
      throw new NotFoundException(`Activity ${id} not found`);
    }
  }
}