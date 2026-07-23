import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

  @Prop({ default: 'free', trim: true })
  plan!: string;

  @Prop({ type: OrganizationSettingsSchema, default: () => ({}) })
  settings!: OrganizationSettingsSubdoc;
}

export const OrganizationEntitySchema = SchemaFactory.createForClass(OrganizationEntity);
