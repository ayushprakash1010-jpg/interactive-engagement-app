import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrganizationEntity, OrganizationDocument } from './organization.schema';
import { UserEntity, UserDocument } from '../users/user.schema';
import { SubscriptionService } from '../billing/subscription.service';
import { EntitlementService } from '../billing/entitlement.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectModel(OrganizationEntity.name)
    private readonly organizationModel: Model<OrganizationDocument>,
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    private readonly subscriptionService: SubscriptionService,
    private readonly entitlementService: EntitlementService,
  ) {}

  async createOrganization(user: AuthenticatedUser, dto: { name: string }) {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Organization name is required');
    }

    // 1. Safety Check: Ensure the user doesn't already have an organization
    const existingUser = await this.userModel.findOne({ auth0Sub: user.auth0Sub });
    if (existingUser?.organizationId) {
      throw new BadRequestException('You already belong to a workspace');
    }

    // 2. Create the organization
    const org = await this.organizationModel.create({
      name: dto.name.trim(),
      plan: 'free',
      stripeCustomerId: null,
      isActive: true,
    });

    const orgId = org._id.toString();

    // 3. Assign default plan via Billing subsystem
    await this.subscriptionService.assignPlanToOrg(
      orgId,
      'free',
      `Onboarding creation by user ${user.auth0Sub}`
    );

    // 4. Update the user to belong to this new organization
    await this.userModel.findOneAndUpdate(
      { auth0Sub: user.auth0Sub },
      {
        $set: {
          organizationId: orgId,
          organizationName: org.name,
        }
      }
    );

    // 5. Invalidate entitlement cache just in case
    this.entitlementService.invalidateCache(orgId);

    this.logger.log(`User ${user.auth0Sub} created organization ${orgId} (${org.name})`);

    return org;
  }
}
