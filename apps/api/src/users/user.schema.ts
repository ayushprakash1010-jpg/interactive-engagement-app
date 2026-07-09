// apps/api/src/users/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserEntity>;

@Schema({ _id: false })
export class UserIntegrationSubdoc {
  @Prop({ required: true, enum: ['zoom', 'teams', 'webex', 'meet'] })
  provider!: string;

  @Prop({ required: true })
  externalId!: string;

  @Prop({ type: String, default: null })
  refreshToken?: string | null;
}

const UserIntegrationSchema = SchemaFactory.createForClass(UserIntegrationSubdoc);

@Schema({ timestamps: true, collection: 'users' })
export class UserEntity {
  @Prop({ required: true, unique: true, index: true, trim: true })
  auth0Sub!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({
    required: true,
    enum: ['host', 'admin'],
    default: 'host',
  })
  role!: 'host' | 'admin';

  @Prop({ default: 'free', trim: true })
  plan!: string;

  @Prop({ default: 0 })
  aiUsageCount!: number;

  @Prop({ type: [UserIntegrationSchema], default: [] })
  integrations!: UserIntegrationSubdoc[];
}

export const UserEntitySchema = SchemaFactory.createForClass(UserEntity);