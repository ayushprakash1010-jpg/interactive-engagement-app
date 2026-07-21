import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupportTicketDocument = SupportTicketEntity & Document;

@Schema({ timestamps: true })
export class SupportTicketNote {
  @Prop({ type: Types.ObjectId, required: true })
  authorId!: Types.ObjectId;

  @Prop({ required: true })
  authorName!: string;

  @Prop({ required: true })
  note!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

@Schema({ collection: 'support_tickets', timestamps: true })
export class SupportTicketEntity extends Document {
  @Prop({ required: true })
  customerEmail!: string;

  @Prop()
  customerName?: string;

  @Prop({ type: Types.ObjectId, ref: 'UserEntity' })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' })
  status!: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

  @Prop({ required: true, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' })
  priority!: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @Prop({ type: Types.ObjectId, ref: 'UserEntity' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: [SchemaFactory.createForClass(SupportTicketNote)], default: [] })
  internalNotes!: SupportTicketNote[];

  @Prop()
  resolutionNote?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicketEntity);

// Indexes for searching and filtering
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ priority: 1 });
SupportTicketSchema.index({ customerEmail: 1 });
SupportTicketSchema.index({ userId: 1 });
SupportTicketSchema.index({ createdAt: -1 });
