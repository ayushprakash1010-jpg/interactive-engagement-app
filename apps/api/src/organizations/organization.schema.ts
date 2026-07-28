import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrganizationDocument = HydratedDocument<OrganizationEntity>;

@Schema({ _id: false })
class OrganizationSettingsSubdoc {
  @Prop({ default: false })
  aiStudioEnabled!: boolean;

  @Prop({ default: false })
  advancedAnalyticsEnabled!: boolean;

  @Prop({ default: false })
  customBrandingEnabled!: boolean;
}

const OrganizationSettingsSchema = SchemaFactory.createForClass(OrganizationSettingsSubdoc);

@Schema({ timestamps: true, collection: 'organizations' })
export class OrganizationEntity {
  @Prop({ required: true, trim: true, index: true })
  name!: string;

  /** @deprecated Read from SubscriptionEntity instead for rich billing state */
  @Prop({ type: String, default: 'free', trim: true })
  plan!: string;

  /** Reference to the dedicated Subscription document */
  @Prop({
    type: Types.ObjectId,
    ref: 'SubscriptionEntity',
    default: null,
  })
  subscriptionId?: Types.ObjectId | null;

  @Prop({ type: OrganizationSettingsSchema, default: () => ({}) })
  settings!: OrganizationSettingsSubdoc;
}

export const OrganizationEntitySchema = SchemaFactory.createForClass(OrganizationEntity);
