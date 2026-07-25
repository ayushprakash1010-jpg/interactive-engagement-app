import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MigrationDocument = HydratedDocument<MigrationEntity>;

@Schema({ timestamps: true, collection: 'migrations' })
export class MigrationEntity {
  @Prop({ required: true, unique: true, index: true, trim: true })
  migrationId!: string; // e.g. 'billing-subscription-v1'

  @Prop({ required: true, default: Date.now })
  completedAt!: Date;
}

export const MigrationEntitySchema = SchemaFactory.createForClass(MigrationEntity);
