// apps/api/src/users/users.service.ts
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

  // ── Upsert ────────────────────────────────────────────────────────────────

  /**
   * Creates the user if `auth0Sub` is not found; otherwise updates
   * `name` and `email` to reflect the latest values from the token.
   *
   * Uses `findOneAndUpdate` with `upsert: true` so it is safe to call
   * concurrently on the first request — MongoDB's unique index on
   * `auth0Sub` prevents duplicate documents.
   */
  async upsert(dto: UpsertUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findOneAndUpdate(
        { auth0Sub: dto.auth0Sub },
        {
          $set: {
            name: dto.name,
            email: dto.email,
          },
          // Only applied on insert — never overwrite an existing role/plan
          $setOnInsert: {
            auth0Sub: dto.auth0Sub,
            role: 'host',
            plan: 'free',
          },
        },
        {
          upsert: true,
          new: true,       // return the document after update/insert
          lean: false,     // return a full Mongoose document (needed by jwt.strategy)
          runValidators: true,
        },
      )
      .exec();

    // findOneAndUpdate with upsert + new:true always returns a document
    return user as UserDocument;
  }

  // ── Find by Auth0 sub ─────────────────────────────────────────────────────

  /**
   * Looks up a user by their Auth0 subject identifier.
   * Returns `null` when the user has never authenticated before
   * (i.e. upsert has not been called yet for this sub).
   */
  async findByAuth0Sub(auth0Sub: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ auth0Sub })
      .lean()
      .exec() as unknown as UserDocument | null;
  }

  // ── Find by MongoDB _id ───────────────────────────────────────────────────

  /**
   * Looks up a user by their MongoDB ObjectId.
   * Throws `NotFoundException` if the id is malformed or the document
   * does not exist — safe to call directly from a controller.
   */
  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const user = await this.userModel
      .findById(id)
      .lean()
      .exec() as unknown as UserDocument | null;

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }
}