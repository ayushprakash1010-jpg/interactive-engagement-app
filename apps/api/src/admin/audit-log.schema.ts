import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AdminAuditLogDocument = HydratedDocument<AdminAuditLogEntity>;

@Schema({ timestamps: true, collection: 'admin_audit_logs' })
export class AdminAuditLogEntity {
  @Prop({ type: String, required: true, index: true })
  adminId!: string;

  @Prop({ type: String, required: true, index: true })
  adminEmail!: string;

  @Prop({ type: String, required: true, index: true })
  actionType!: string;

  @Prop({ type: String, required: true, enum: ['Event', 'User', 'System'] })
  targetResourceType!: string;

  @Prop({ type: String, required: true, index: true })
  targetResourceId!: string;

  @Prop({ type: String, default: null })
  reason?: string | null;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata?: Record<string, any>;
}

export const AdminAuditLogEntitySchema = SchemaFactory.createForClass(AdminAuditLogEntity);
