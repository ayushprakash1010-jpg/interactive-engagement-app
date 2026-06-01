// apps/api/src/events/events.service.ts
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

  // ── Create ────────────────────────────────────────────────────────────────

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

  // ── List (host's own) ─────────────────────────────────────────────────────

  async findAllByHost(hostId: string): Promise<EventDocument[]> {
    return this.eventModel
      .find({ hostId: new Types.ObjectId(hostId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as unknown as EventDocument[];
  }

  // ── Get one ───────────────────────────────────────────────────────────────

  async findOne(id: string, hostId: string): Promise<EventDocument> {
    this.assertObjectId(id);

    const event = await this.eventModel
      .findById(id)
      .lean()
      .exec() as unknown as EventDocument | null;

    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    this.assertOwnership(event, hostId);
    return event;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(
    id: string,
    hostId: string,
    dto: UpdateEvent,
  ): Promise<EventDocument> {
    this.assertObjectId(id);

    const event = await this.eventModel.findById(id).exec();
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    this.assertOwnership(event, hostId);

    // Merge settings partially if provided
    if (dto.settings) {
      event.settings = { ...event.settings, ...dto.settings } as any;
    }
    if (dto.name !== undefined) event.name = dto.name;
    if (dto.description !== undefined) event.description = dto.description;

    await event.save();
    return event;
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async remove(id: string, hostId: string): Promise<void> {
    this.assertObjectId(id);

    const event = await this.eventModel.findById(id).exec();
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    this.assertOwnership(event, hostId);

    await event.deleteOne();
  }

  // ── QR + join URL ─────────────────────────────────────────────────────────

  async getQr(
    id: string,
    hostId: string,
  ): Promise<{ eventCode: string; joinUrl: string; qrDataUrl: string }> {
    const event = await this.findOne(id, hostId);

    // WEB_ORIGIN is the public origin of the Next.js web app (validated in
    // env.validation, default http://localhost:3000) — participants join there.
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

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Generates a collision-free event code by retrying up to MAX_CODE_RETRIES
   * times. Relies on the unique index on `eventCode` in the schema.
   */
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

  private assertOwnership(
    event: EventDocument,
    hostId: string,
  ): void {
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