import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeService } from './knowledge.service';
import { getModelToken } from '@nestjs/mongoose';
import { AdminService } from '../admin/admin.service';

describe('KnowledgeService', () => {
  let service: KnowledgeService;

  const mockModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockAdminService = {
    createAuditLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeService,
        {
          provide: getModelToken('KnowledgeArticleEntity'),
          useValue: mockModel,
        },
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    service = module.get<KnowledgeService>(KnowledgeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update an article status from DRAFT to PUBLISHED', async () => {
    const mockArticle = {
      slug: 'test-article',
      status: 'DRAFT',
      set: jest.fn().mockImplementation(function(this: any, dto: any) {
        Object.assign(this, dto);
      }),
      save: jest.fn().mockResolvedValue(true),
      id: 'article-id',
      title: 'Test Article',
    };
    mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockArticle) });

    const adminUser = { id: '507f1f77bcf86cd799439011', auth0Sub: 'sub1', email: 'admin@test.com' } as any;
    const dto = { status: 'PUBLISHED' as const };

    const result = await service.update('test-article', dto, adminUser);
    
    expect(mockArticle.set).toHaveBeenCalledWith(dto);
    expect(result.status).toBe('PUBLISHED');
    expect(mockAdminService.createAuditLog).toHaveBeenCalled();
  });
});
