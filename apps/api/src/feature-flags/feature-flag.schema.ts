import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type FeatureFlagDocument = HydratedDocument<FeatureFlagEntity>;

@Schema({ timestamps: true, collection: 'feature_flags' })
export class FeatureFlagEntity {
  @Prop({ required: true, unique: true, trim: true, index: true })
  key!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ required: true, default: false })
  isGlobalEnabled!: boolean;

  // Organization-specific overrides. Map of OrgId (string) -> isEnabled (boolean)
  @Prop({ type: MongooseSchema.Types.Map, of: Boolean, default: {} })
  organizationOverrides!: Map<string, boolean>;
}

export const FeatureFlagEntitySchema = SchemaFactory.createForClass(FeatureFlagEntity);
