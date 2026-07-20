import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { UserEntity } from '../users/user.schema';
import { EventEntity } from '../events/event.schema';
import { OrganizationEntity } from '../organizations/organization.schema';
import { AdminAuditLogEntity } from './audit-log.schema';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { EventsService } from '../events/events.service';
import { Types } from 'mongoose';

describe('AdminService', () => {
  let service: AdminService;
  let userModel: any;
  let auditLogModel: any;

  beforeEach(async () => {
    userModel = {
      countDocuments: jest.fn().mockResolvedValue(100),
      aggregate: jest.fn().mockResolvedValue([{ totalAIRequests: 50 }]),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getModelToken(UserEntity.name), useValue: userModel },
        { provide: getModelToken(EventEntity.name), useValue: { countDocuments: jest.fn().mockResolvedValue(50) } },
        { provide: getModelToken(OrganizationEntity.name), useValue: { countDocuments: jest.fn().mockResolvedValue(10) } },
        { provide: getModelToken(AdminAuditLogEntity.name), useValue: { create: jest.fn().mockResolvedValue({}) } },
        { provide: RealtimeGateway, useValue: {} },
        { provide: EventsService, useValue: {} },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('signed-token') } },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    auditLogModel = module.get(getModelToken(AdminAuditLogEntity.name));
    
    // Lock time for boundary tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should compute DAU and MAU boundaries correctly in getAnalytics', async () => {
    await service.getAnalytics();

    // Verify DAU query (24 hours ago)
    const expectedDauBoundary = new Date('2024-01-14T12:00:00Z');
    expect(userModel.countDocuments).toHaveBeenCalledWith({
      lastActiveAt: { $gte: expectedDauBoundary },
    });

    // Verify MAU query (30 days ago)
    const expectedMauBoundary = new Date('2023-12-16T12:00:00Z'); // 30 days before Jan 15 2024
    expect(userModel.countDocuments).toHaveBeenCalledWith({
      lastActiveAt: { $gte: expectedMauBoundary },
    });
  });

  describe('Impersonation', () => {
    const adminUser: any = { id: 'admin1', email: 'admin@test.com', role: 'admin' };

    it('should generate a handoff code and exchange it for a token', async () => {
      userModel.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'host1',
            role: 'host',
            email: 'host@test.com',
          })
        })
      });

      const { handoffCode } = await service.createImpersonationToken(adminUser, 'host1', 'Ticket 1234 - debugging');
      expect(handoffCode).toBeDefined();

      expect(auditLogModel.create).toHaveBeenCalledWith(expect.objectContaining({
        adminId: 'admin1',
        adminEmail: 'admin@test.com',
        actionType: 'ADMIN_STARTED_IMPERSONATION',
        targetResourceType: 'User',
        targetResourceId: 'host1',
        reason: 'Ticket 1234 - debugging',
      }));

      const { token } = await service.exchangeHandoffCode(handoffCode);
      expect(token).toBe('signed-token');
    });

    it('should prevent exchanging the same handoff code twice', async () => {
      userModel.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'host1',
            role: 'host',
            email: 'host@test.com',
          })
        })
      });

      const { handoffCode } = await service.createImpersonationToken(adminUser, 'host1', 'Ticket 1234 - debugging');
      await service.exchangeHandoffCode(handoffCode);

      await expect(service.exchangeHandoffCode(handoffCode)).rejects.toThrow('Invalid or expired handoff code');
    });

    it('should reject expired handoff codes', async () => {
      userModel.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'host1',
            role: 'host',
            email: 'host@test.com',
          })
        })
      });

      const { handoffCode } = await service.createImpersonationToken(adminUser, 'host1', 'Ticket 1234 - debugging');

      // Advance time past 60 seconds
      jest.setSystemTime(new Date('2024-01-15T12:01:05Z'));

      await expect(service.exchangeHandoffCode(handoffCode)).rejects.toThrow('Handoff code expired');
    });

    it('should reject impersonating admin or support users', async () => {
      userModel.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'admin2',
            role: 'admin',
            email: 'admin2@test.com',
          })
        })
      });

      await expect(service.createImpersonationToken(adminUser, 'admin2', 'testing - reason')).rejects.toThrow('Cannot impersonate an admin or support user.');

      expect(auditLogModel.create).toHaveBeenCalledWith(expect.objectContaining({
        adminId: 'admin1',
        adminEmail: 'admin@test.com',
        actionType: 'IMPERSONATION_FAILED',
        targetResourceType: 'User',
        targetResourceId: 'admin2',
        reason: 'Attempted to impersonate an admin or support user',
      }));
    });

    it('should validate reason length', async () => {
      await expect(service.createImpersonationToken(adminUser, 'host1', 'short')).rejects.toThrow('A valid reason between 10 and 200 characters is required');
    });

    it('should log when impersonation is stopped', async () => {
      const impersonatedUser: any = {
        id: 'host1',
        impersonatorId: 'admin1',
        impersonatorEmail: 'admin@test.com',
      };

      const result = await service.logImpersonationStopped(impersonatedUser);
      expect(result.success).toBe(true);

      expect(auditLogModel.create).toHaveBeenCalledWith(expect.objectContaining({
        adminId: 'admin1',
        adminEmail: 'admin@test.com',
        actionType: 'ADMIN_STOPPED_IMPERSONATION',
        targetResourceType: 'User',
        targetResourceId: 'host1',
        reason: null,
      }));
    });
  });

  describe('User Suspension', () => {
    it('should allow an admin to suspend a host and generate an audit log', async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId('5f4d2a8b9d8f8a1234567891'),
          role: 'host',
          isSuspended: false,
          save: jest.fn().mockResolvedValue(true),
        }),
      } as any);

      const result = await service.suspendUser('admin1', 'admin@test.com', '5f4d2a8b9d8f8a1234567891', 'Violation of terms');
      expect(result.success).toBe(true);
      expect(auditLogModel.create).toHaveBeenCalledWith(expect.objectContaining({
        actionType: 'USER_SUSPENDED',
        reason: 'Violation of terms'
      }));
    });

    it('should prevent an admin from suspending themselves', async () => {
      await expect(service.suspendUser('admin1', 'admin@test.com', 'admin1', 'test')).rejects.toThrow('You cannot suspend your own account.');
    });

    it('should prevent suspending an admin or support user', async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId('5f4d2a8b9d8f8a1234567892'),
          role: 'support',
          isSuspended: false,
        }),
      } as any);

      await expect(service.suspendUser('admin1', 'admin@test.com', '5f4d2a8b9d8f8a1234567892', 'test')).rejects.toThrow('Cannot suspend a privileged account.');
    });

    it('should allow reactivating a user', async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId('5f4d2a8b9d8f8a1234567891'),
          role: 'host',
          isSuspended: true,
          save: jest.fn().mockResolvedValue(true),
        }),
      } as any);

      const result = await service.reactivateUser('admin1', 'admin@test.com', '5f4d2a8b9d8f8a1234567891', 'Appealed');
      expect(result.success).toBe(true);
      expect(auditLogModel.create).toHaveBeenCalledWith(expect.objectContaining({
        actionType: 'USER_REACTIVATED',
        reason: 'Appealed'
      }));
    });
  });
});
