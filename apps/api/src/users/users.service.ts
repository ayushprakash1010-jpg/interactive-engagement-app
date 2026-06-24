import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEntity, UserDocument } from './user.schema';

export interface UpsertUserDto {
  auth0Sub: string;
  name: string;
  email: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async upsert(dto: UpsertUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findOneAndUpdate(
        { auth0Sub: dto.auth0Sub },
        {
          $set: {
            name: dto.name,
            email: dto.email,
          },
          $setOnInsert: {
            auth0Sub: dto.auth0Sub,
            role: 'host',
            plan: 'free',
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

    return user as UserDocument;
  }

  async findByAuth0Sub(auth0Sub: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ auth0Sub }).exec();
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