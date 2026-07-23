import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CopilotConversationDocument = HydratedDocument<CopilotConversationEntity>;

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
  references?: {
    resourceType: string;
    resourceId: string;
    label: string;
    adminPath: string;
  }[];
}

@Schema({ timestamps: true, collection: 'copilot_conversations' })
export class CopilotConversationEntity {
  @Prop({ type: String, required: true, index: true })
  adminId!: string;

  @Prop({ type: String, required: true })
  adminEmail!: string;

  @Prop({
    type: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        toolsUsed: [{ type: String }],
      },
    ],
    default: [],
  })
  messages!: CopilotMessage[];

  @Prop({ type: Object, default: null })
  pageContext?: { type: string; id: string } | null;

  /** Auto-expire after 30 days */
  @Prop({ type: Date, expires: '30d', default: Date.now })
  createdAt!: Date;
}

export const CopilotConversationSchema = SchemaFactory.createForClass(CopilotConversationEntity);
