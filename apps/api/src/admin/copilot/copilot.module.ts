import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CopilotController } from './copilot.controller';
import { CopilotService } from './copilot.service';
import { CopilotConversationEntity, CopilotConversationSchema } from './conversation.schema';
import { AiOperationLogEntity, AiOperationLogSchema } from '../../ai/ai-operation-log.schema';
import { AdminAuditLogEntity, AdminAuditLogEntitySchema } from '../audit-log.schema';
import { KnowledgeArticleEntity, KnowledgeArticleSchema } from '../../knowledge/schemas/knowledge-article.schema';
import { AdminModule } from '../admin.module';
import { SupportModule } from '../../support/support.module';
import { KnowledgeModule } from '../../knowledge/knowledge.module';
import { RealtimeModule } from '../../realtime/realtime.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CopilotConversationEntity.name, schema: CopilotConversationSchema },
      { name: AiOperationLogEntity.name, schema: AiOperationLogSchema },
      { name: AdminAuditLogEntity.name, schema: AdminAuditLogEntitySchema },
      { name: KnowledgeArticleEntity.name, schema: KnowledgeArticleSchema },
    ]),
    AdminModule,
    SupportModule,
    KnowledgeModule,
    RealtimeModule,
    AuthModule,
  ],
  controllers: [CopilotController],
  providers: [CopilotService],
  exports: [CopilotService],
})
export class CopilotModule {}
