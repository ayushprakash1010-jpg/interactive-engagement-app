import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FeatureFlagsService } from './feature-flags.service';
import { FeatureFlagEntity } from './feature-flag.schema';
import { AdminAuditLogEntity } from '../admin/audit-log.schema';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;
  let model: any;

  beforeEach(async () => {
    model = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            key: 'test-flag',
            isGlobalEnabled: false,
            organizationOverrides: new Map([
              ['org-123', true],
              ['org-456', false],
            ]),
          },
          {
            key: 'global-flag',
            isGlobalEnabled: true,
            organizationOverrides: new Map(),
          },
        ]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagsService,
        { provide: getModelToken(FeatureFlagEntity.name), useValue: model },
        { provide: getModelToken(AdminAuditLogEntity.name), useValue: {} },
      ],
    }).compile();

    service = module.get<FeatureFlagsService>(FeatureFlagsService);
  });

  it('should evaluate flags correctly based on precedence rules', async () => {
    // Manually trigger cache load
    await service.onModuleInit();

    // 1. User with no org (gets globals)
    const resultNoOrg = service.evaluateAllForUser(null);
    expect(resultNoOrg['test-flag']).toBe(false);
    expect(resultNoOrg['global-flag']).toBe(true);

    // 2. User in org-123 (override true)
    const resultOrg123 = service.evaluateAllForUser('org-123');
    expect(resultOrg123['test-flag']).toBe(true);
    expect(resultOrg123['global-flag']).toBe(true);

    // 3. User in org-456 (override false)
    const resultOrg456 = service.evaluateAllForUser('org-456');
    expect(resultOrg456['test-flag']).toBe(false);
    expect(resultOrg456['global-flag']).toBe(true);

    // 4. User in unknown org (falls back to globals)
    const resultOrg789 = service.evaluateAllForUser('org-789');
    expect(resultOrg789['test-flag']).toBe(false);
    expect(resultOrg789['global-flag']).toBe(true);
  });

  it('should fail safely if MongoDB is unreachable during cache refresh', async () => {
    // Break the mock
    model.find.mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error('Connection lost')),
    });

    await service.onModuleInit(); // Should not throw

    const result = service.evaluateAllForUser('org-123');
    expect(result).toEqual({}); // Empty cache means fallback to default `false` on frontend
  });
});
