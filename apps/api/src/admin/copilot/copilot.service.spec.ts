import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { CopilotService, safeStringify, pendingActions } from './copilot.service';
import { AdminService } from '../admin.service';
import { SupportService } from '../../support/support.service';
import { KnowledgeService } from '../../knowledge/knowledge.service';
import { AiOperationLogEntity } from '../../ai/ai-operation-log.schema';
import { AdminAuditLogEntity } from '../audit-log.schema';
import { CopilotConversationEntity } from './conversation.schema';
import { KnowledgeArticleEntity } from '../../knowledge/schemas/knowledge-article.schema';

const mockAdminUser = {
  _id: 'admin_id_1',
  auth0Sub: 'auth0|admin1',
  email: 'admin@test.com',
  role: 'admin',
};

const mockSupportUser = {
  _id: 'support_id_1',
  auth0Sub: 'auth0|support1',
  email: 'support@test.com',
  role: 'support',
};

describe('CopilotService', () => {
  let service: CopilotService;
  let adminService: any;
  let supportService: any;
  let articleModel: any;

  beforeEach(async () => {
    adminService = {
      getUserById: jest.fn(),
      getUsers: jest.fn(),
      getEventById: jest.fn(),
      getEvents: jest.fn(),
      suspendUser: jest.fn(),
    };
    supportService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CopilotService,
        { provide: ConfigService, useValue: { get: () => 'fake-key' } },
        { provide: AdminService, useValue: adminService },
        { provide: SupportService, useValue: supportService },
        { provide: KnowledgeService, useValue: {} },
        { provide: getModelToken(CopilotConversationEntity.name), useValue: { create: jest.fn(), findById: jest.fn(), findByIdAndUpdate: jest.fn() } },
        { provide: getModelToken(AiOperationLogEntity.name), useValue: { create: jest.fn() } },
        { provide: getModelToken(AdminAuditLogEntity.name), useValue: { create: jest.fn() } },
        { provide: getModelToken(KnowledgeArticleEntity.name), useValue: { find: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<CopilotService>(CopilotService);
    articleModel = module.get(getModelToken(KnowledgeArticleEntity.name));
    // Mock the pending actions map via import
    pendingActions.clear();
  });

  describe('RBAC & Tool Execution', () => {
    it('should allow admin to use read tools', async () => {
      adminService.getUserById.mockResolvedValue({ _id: '1', profile: {} });
      const res = await (service as any).executeTool('lookupUser', { identifier: '1' }, mockAdminUser);
      expect(res.result).not.toContain('Error');
    });

    it('should allow support to use read tools', async () => {
      adminService.getUserById.mockResolvedValue({ _id: '1', profile: {} });
      const res = await (service as any).executeTool('lookupUser', { identifier: '1' }, mockSupportUser);
      expect(res.result).not.toContain('Error');
    });

    it('should block support from proposing write actions', async () => {
      const res = await (service as any).executeTool('proposeSuspendUser', { userId: '1', reason: 'test' }, mockSupportUser);
      expect(res.result).toContain('is not authorized to use the "proposeSuspendUser" tool');
    });

    it('should allow admin to propose write actions', async () => {
      adminService.getUserById.mockResolvedValue({ profile: { name: 't', email: 'e' } });
      const res = await (service as any).executeTool('proposeSuspendUser', { userId: '1', reason: 'test' }, mockAdminUser);
      expect(res.result).toContain('Confirmation required');
      expect(res.pendingAction).toBeDefined();
    });
  });

  describe('Write Action Security (Replay, Expiration, Cross-Admin)', () => {
    it('should execute confirmed action for correct admin and consume the action (replay protection)', async () => {
      // Propose
      const prop = await (service as any).executeTool('proposeSuspendUser', { userId: 'u1', reason: 'r' }, mockAdminUser);
      const actionId = prop.pendingAction.actionId;

      // Confirm
      const execResult = await service.executeConfirmedAction(actionId, mockAdminUser as any);
      expect(execResult).toContain('has been suspended');
      expect(adminService.suspendUser).toHaveBeenCalled();

      // Second attempt (replay) should fail
      await expect(service.executeConfirmedAction(actionId, mockAdminUser as any)).rejects.toThrow('Action not found or has expired');
    });

    it('should block Admin B from confirming Admin A pending action', async () => {
      const prop = await (service as any).executeTool('proposeSuspendUser', { userId: 'u1', reason: 'r' }, mockAdminUser);
      const actionId = prop.pendingAction.actionId;

      const adminB = { ...mockAdminUser, _id: 'admin_id_2', auth0Sub: 'auth0|admin2' };
      await expect(service.executeConfirmedAction(actionId, adminB as any)).rejects.toThrow('You cannot confirm an action requested by someone else.');
    });

    it('should block expired actions', async () => {
      const prop = await (service as any).executeTool('proposeSuspendUser', { userId: 'u1', reason: 'r' }, mockAdminUser);
      const actionId = prop.pendingAction.actionId;
      
      // Fast forward time for this entry
      if (pendingActions.has(actionId)) {
         pendingActions.get(actionId)!.expiresAt = 0;
      }
      
      await expect(service.executeConfirmedAction(actionId, mockAdminUser as any)).rejects.toThrow('Action confirmation window has expired');
    });
  });

  describe('Data Sanitization', () => {
    it('should recursively strip sensitive fields (auth0Sub, password, etc)', () => {
      const dirty = {
        name: 'Test',
        auth0Sub: 'auth0|123',
        profile: {
          email: 't@t.com',
          secretKey: 'abc',
          passwordHash: 'xxx',
          api_key: '123'
        },
        tokens: ['a', 'b']
      };
      const cleanJson = safeStringify(dirty);
      const clean = JSON.parse(cleanJson);
      expect(clean.name).toBe('Test');
      expect(clean.auth0Sub).toBeUndefined();
      expect(clean.profile.email).toBe('t@t.com');
      expect(clean.profile.secretKey).toBeUndefined();
      expect(clean.profile.passwordHash).toBeUndefined();
      expect(clean.profile.api_key).toBeUndefined();
    });
  });

  describe('Identifier Resolution', () => {
    it('lookupUser resolves valid MongoID', async () => {
      adminService.getUserById.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', profile: { name: 'A' } });
      const res = await (service as any).executeTool('lookupUser', { identifier: '507f1f77bcf86cd799439011' }, mockAdminUser);
      expect(adminService.getUserById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.result).toContain('A');
    });

    it('lookupUser falls back to search for email', async () => {
      adminService.getUsers.mockResolvedValue({ data: [{ id: 'user2' }] });
      adminService.getUserById.mockResolvedValue({ _id: 'user2', profile: { name: 'B' } });
      const res = await (service as any).executeTool('lookupUser', { identifier: 'test@email.com' }, mockAdminUser);
      expect(adminService.getUsers).toHaveBeenCalledWith(expect.objectContaining({ search: 'test@email.com' }));
      expect(res.result).toContain('B');
    });
  });

  describe('RAG Knowledge Base', () => {
    it('should retrieve only published articles and format them', async () => {
      articleModel.lean.mockResolvedValue([
        { title: 'Test Article', content: 'This is a test content that is helpful.' }
      ]);
      const res = await (service as any).fetchRelevantArticles('test helpful');
      expect(articleModel.find).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }));
      expect(res).toContain('Test Article');
      expect(res).toContain('This is a test content');
    });

    it('should return empty string if no keywords are matched', async () => {
      articleModel.lean.mockResolvedValue([]);
      const res = await (service as any).fetchRelevantArticles('xyz123');
      expect(res).toBe('');
    });

    it('should not query if query has no long words', async () => {
      articleModel.find.mockClear();
      const res = await (service as any).fetchRelevantArticles('hi to do');
      expect(articleModel.find).not.toHaveBeenCalled();
      expect(res).toBe('');
    });
  });
});
