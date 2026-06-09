import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EventEntity, EventDocument } from '../events/event.schema';
import { UserEntity, UserDocument } from '../users/user.schema';

/**
 * Admin-only oversight surface (Sprint 7 RBAC). Every route requires a valid
 * Auth0 token (JwtAuthGuard) AND role='admin' (RolesGuard + @Roles).
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /** Platform-wide rollup, restricted to admins. */
  @Get('stats')
  async stats() {
    const [totalEvents, liveEvents, totalHosts] = await Promise.all([
      this.eventModel.estimatedDocumentCount().exec(),
      this.eventModel.countDocuments({ status: 'live' }).exec(),
      this.userModel.estimatedDocumentCount().exec(),
    ]);

    return { totalEvents, liveEvents, totalHosts };
  }
}
