// apps/api/src/participants/participant.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ParticipantDocument = HydratedDocument<ParticipantEntity>;

@Schema({ timestamps: true, collection: 'participants' })
export class ParticipantEntity {
  @Prop({
    type: Types.ObjectId,
    ref: 'EventEntity',
    required: true,
    index: true,
  })
  eventId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  anonId!: string;

  @Prop({ trim: true })
  displayName?: string;

  @Prop({ default: true })
  connected!: boolean;
}

export const ParticipantEntitySchema =
  SchemaFactory.createForClass(ParticipantEntity);

// Unique compound index — prevents duplicate anonId entries per event
// and is the lookup key for upsert / disconnect operations
ParticipantEntitySchema.index({ eventId: 1, anonId: 1 }, { unique: true });
