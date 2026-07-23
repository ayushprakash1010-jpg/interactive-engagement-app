import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEntity, UserDocument } from './user.schema';

export interface UpsertUserDto {
  auth0Sub: string;
  name: string;
  email: string;
}

export interface UpsertOptions {
  skipProfileUpdate?: boolean;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly activityCache = new Map<string, number>();

  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async upsert(dto: UpsertUserDto, options?: UpsertOptions): Promise<UserDocument> {
    const now = Date.now();
    const lastActive = this.activityCache.get(dto.auth0Sub) || 0;
    
    // Throttle updates to once every 15 minutes per user
    const shouldUpdateActivity = (now - lastActive) > 15 * 60 * 1000;

    const setPayload: any = {};
    if (!options?.skipProfileUpdate) {
      setPayload.name = dto.name;
      setPayload.email = dto.email;
    }

    if (shouldUpdateActivity) {
      setPayload.lastActiveAt = new Date();
    }

    // If nothing to set and the user already exists, we could theoretically skip the DB call entirely.
    // However, upsert must return the UserDocument, and we still need to insert if they don't exist.
    // For safety, we always run the findOneAndUpdate.

    const user = await this.userModel
      .findOneAndUpdate(
        { auth0Sub: dto.auth0Sub },
        {
          $set: setPayload,
          $setOnInsert: {
            auth0Sub: dto.auth0Sub,
            role: 'host',
            plan: 'free',
            ...(options?.skipProfileUpdate ? { name: dto.name, email: dto.email } : {})
          },
        },
        {
          upsert: true,
          new: true,
          lean: false,
          runValidators: true,
        },
      )
      .exec();

    if (shouldUpdateActivity) {
      this.activityCache.set(dto.auth0Sub, now);
    }

    return user as UserDocument;
  }

  async findByAuth0Sub(auth0Sub: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ auth0Sub }).exec();
  }

  async findByZoomId(zoomUserId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        'integrations.provider': 'zoom',
        $or: [
          { 'integrations.externalId': zoomUserId },
          { 'integrations.zoomUserId': zoomUserId },
        ],
      })
      .exec();
  }

  async findByTeamsId(teamsUserId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        'integrations.provider': 'teams',
        $or: [
          { 'integrations.externalId': teamsUserId },
          { 'integrations.zoomUserId': teamsUserId },
        ],
      })
      .exec();
  }

  async findByGoogleMeetId(meetUserId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        'integrations.provider': 'meet',
        'integrations.externalId': meetUserId,
      })
      .exec();
  }

  async findByPowerPointId(microsoftUserId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        'integrations.provider': 'powerpoint',
        'integrations.externalId': microsoftUserId,
      })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }
}
