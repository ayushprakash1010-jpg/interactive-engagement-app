import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { CreateEvent, UpdateEvent } from '@iep/types';
import { EventEntity, EventDocument } from './event.schema';
import { generateEventCode } from './utils/event-code.util';

const MAX_CODE_RETRIES = 5;

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
    private readonly configService: ConfigService,
  ) {}

  async create(hostId: string, dto: CreateEvent): Promise<EventDocument> {
    const eventCode = await this.generateUniqueCode();

    const event = await this.eventModel.create({
      hostId: new Types.ObjectId(hostId),
      name: dto.name,
      description: dto.description,
      eventCode,
      status: 'draft',
      settings: dto.settings ?? {
        allowAnonymousQA: true,
        requireModeration: false,
        participantNames: false,
      },
    });

    return event;
  }

  async findAllByHost(hostId: string): Promise<EventDocument[]> {
    return this.eventModel
      .find({ hostId: new Types.ObjectId(hostId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as unknown as EventDocument[];
  }

  async findOne(id: string, hostId: string): Promise<EventDocument> {
    this.assertObjectId(id);

    const event = (await this.eventModel
      .findById(id)
      .lean()
      .exec()) as unknown as EventDocument | null;

    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    this.assertOwnership(event, hostId);
    return event;
  }

  async findByEventCode(code: string): Promise<EventDocument | null> {
    return this.eventModel.findOne({ eventCode: code.toUpperCase() }).exec();
  }

  async update(
    id: string,
    hostId: string,
    dto: UpdateEvent,
  ): Promise<EventDocument> {
    this.assertObjectId(id);

    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    this.assertOwnership(event, hostId);

    if (dto.settings) {
      // FIX: Use Object.assign() to mutate the existing Mongoose EmbeddedDocument
      // in-place rather than replacing it with a plain spread object.
      //
      // The old code was:
      //   event.settings = { ...event.settings, ...dto.settings } as any;
      //
      // Spreading a Mongoose EmbeddedDocument and reassigning it as a plain object
      // is unreliable — Mongoose may not detect the change and save() would silently
      // skip persisting the settings field entirely.
      //
      // Object.assign mutates the existing subdocument directly, triggering Mongoose's
      // per-field setters. markModified then guarantees the path is flushed on save()
      // regardless of Mongoose version behaviour.
      Object.assign(event.settings, dto.settings);
      event.markModified('settings');
    }

    if (dto.name !== undefined) event.name = dto.name;
    if (dto.description !== undefined) event.description = dto.description;

    await event.save();
    return event;
  }

  async remove(id: string, hostId: string): Promise<void> {
    this.assertObjectId(id);

    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    this.assertOwnership(event, hostId);
    await event.deleteOne();
  }

  async getQr(
    id: string,
    hostId: string,
  ): Promise<{ eventCode: string; joinUrl: string; qrDataUrl: string }> {
    const event = await this.findOne(id, hostId);

    const webOrigin = this.configService.get<string>(
      'WEB_ORIGIN',
      'http://localhost:3000',
    );
    const joinUrl = `${webOrigin}/join/${event.eventCode}`;

    const qrDataUrl = await QRCode.toDataURL(joinUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: { dark: '#000000', light: '#ffffff' },
    });

    return { eventCode: event.eventCode, joinUrl, qrDataUrl };
  }

  async setActiveActivity(
    eventId: string,
    activityId: string | null,
  ): Promise<void> {
    await this.eventModel
      .updateOne(
        { _id: new Types.ObjectId(eventId) },
        {
          $set: {
            activeActivityId: activityId
              ? new Types.ObjectId(activityId)
              : null,
          },
        },
      )
      .exec();
  }

  async endEvent(eventId: string): Promise<EventDocument> {
    this.assertObjectId(eventId);

    const event = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $set: {
            status: 'ended',
            endedAt: new Date(),
            activeActivityId: null,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    return event;
  }

  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 1; attempt <= MAX_CODE_RETRIES; attempt++) {
      const code = generateEventCode();
      const exists = await this.eventModel.exists({ eventCode: code }).exec();

      if (!exists) return code;

      this.logger.warn(
        `Event code collision on attempt ${attempt}: ${code} — retrying`,
      );
    }

    throw new InternalServerErrorException(
      'Failed to generate a unique event code after maximum retries',
    );
  }

  private assertOwnership(event: EventDocument, hostId: string): void {
    this.logger.warn(
      `ownership check event.hostId=${event.hostId?.toString()} hostId=${hostId}`,
    );

    if (event.hostId.toString() !== hostId) {
      throw new ForbiddenException('You do not own this event');
    }
  }

  private assertObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Event ${id} not found`);
    }
  }
}