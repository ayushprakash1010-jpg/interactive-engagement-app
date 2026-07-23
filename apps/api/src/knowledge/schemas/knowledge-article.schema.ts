import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KnowledgeArticleDocument = KnowledgeArticleEntity & Document;

@Schema({ collection: 'knowledge_articles', timestamps: true })
export class KnowledgeArticleEntity extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true })
  summary!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({
    required: true,
    enum: [
      'Account & Authentication',
      'Events',
      'Integrations',
      'AI Studio',
      'Feature Flags',
      'Organizations',
      'Billing & Plans',
      'Troubleshooting',
      'System Operations',
      'Other',
    ],
  })
  category!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' })
  status!: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @Prop({ type: Types.ObjectId, ref: 'UserEntity', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserEntity', required: true })
  updatedBy!: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const KnowledgeArticleSchema = SchemaFactory.createForClass(KnowledgeArticleEntity);

// Indexes
KnowledgeArticleSchema.index({ slug: 1 }, { unique: true });
KnowledgeArticleSchema.index({ status: 1 });
KnowledgeArticleSchema.index({ category: 1 });
KnowledgeArticleSchema.index({ tags: 1 });
// Text index for search
KnowledgeArticleSchema.index({ title: 'text', summary: 'text', content: 'text' });
