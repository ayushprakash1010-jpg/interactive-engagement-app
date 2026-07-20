import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PreventImpersonationInterceptor } from '../auth/prevent-impersonation.interceptor';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/jwt.strategy';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: jest.Mocked<AdminService>;

  beforeEach(async () => {
    // Mock the AdminService
    const mockAdminService = {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      getEvents: jest.fn(),
      getEventById: jest.fn(),
      getEventDiagnostics: jest.fn(),
      forceEndEvent: jest.fn(),
      getIntegrations: jest.fn(),
      getAuditLogs: jest.fn(),
      getOrganizations: jest.fn(),
      getOrganizationById: jest.fn(),
      createOrganization: jest.fn(),
      assignUserToOrganization: jest.fn(),
      unassignUserFromOrganization: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        Reflector,
        RolesGuard,
        PreventImpersonationInterceptor,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('RBAC Verification', () => {
    const runRolesGuard = (user: Partial<AuthenticatedUser>, handler: Function) => {
      const guard = new RolesGuard(new Reflector());
      const context = {
        getHandler: () => handler,
        getClass: () => AdminController,
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
      } as unknown as ExecutionContext;
      return guard.canActivate(context);
    };

    it('should allow Admin users to access Admin endpoints', () => {
      const adminUser: Partial<AuthenticatedUser> = { role: 'admin' };
      const result = runRolesGuard(adminUser, controller.me);
      expect(result).toBe(true);
    });

    it('should reject Host users from accessing Admin endpoints with 403 Forbidden', () => {
      const hostUser: Partial<AuthenticatedUser> = { role: 'host' };
      expect(() => runRolesGuard(hostUser, controller.me)).toThrow(ForbiddenException);
    });

    it('should allow Support users to access allowed endpoints', () => {
      const supportUser: Partial<AuthenticatedUser> = { role: 'support' };
      const result = runRolesGuard(supportUser, controller.me);
      expect(result).toBe(true);
    });
  });

  describe('Impersonation Validation', () => {
    const runPreventImpersonationInterceptor = (user: Partial<AuthenticatedUser>, method: string, handler: Function) => {
      const interceptor = new PreventImpersonationInterceptor(new Reflector());
      const context = {
        getHandler: () => handler,
        getClass: () => AdminController,
        switchToHttp: () => ({
          getRequest: () => ({ user, method }),
        }),
      } as unknown as ExecutionContext;
      const next = { handle: jest.fn().mockReturnValue('mock-observable') };
      return interceptor.intercept(context, next as any);
    };

    it('should reject mutation (POST) endpoints for impersonated sessions', () => {
      const impersonatedUser: Partial<AuthenticatedUser> = { role: 'admin', isImpersonating: true };
      expect(() => runPreventImpersonationInterceptor(impersonatedUser, 'POST', controller.forceEndEvent)).toThrow(ForbiddenException);
    });
    
    it('should allow read-only (GET) endpoints for impersonated sessions', () => {
      const impersonatedUser: Partial<AuthenticatedUser> = { role: 'admin', isImpersonating: true };
      const result = runPreventImpersonationInterceptor(impersonatedUser, 'GET', controller.me);
      expect(result).toBeDefined();
    });
    
    it('should allow mutation endpoints for non-impersonated sessions', () => {
      const standardUser: Partial<AuthenticatedUser> = { role: 'admin' };
      const result = runPreventImpersonationInterceptor(standardUser, 'POST', controller.forceEndEvent);
      expect(result).toBeDefined();
    });
  });
});
