import { Test, TestingModule } from '@nestjs/testing';
import { AdminPublicController } from './admin-public.controller';
import { AdminService } from './admin.service';
import { ForbiddenException } from '@nestjs/common';

describe('AdminPublicController', () => {
  let controller: AdminPublicController;
  let adminService: any;

  beforeEach(async () => {
    adminService = {
      exchangeHandoffCode: jest.fn().mockResolvedValue({ token: 'test-token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminPublicController],
      providers: [
        { provide: AdminService, useValue: adminService },
      ],
    }).compile();

    controller = module.get<AdminPublicController>(AdminPublicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exchangeHandoffCode', () => {
    it('should throw ForbiddenException if code is missing', async () => {
      await expect(controller.exchangeHandoffCode('')).rejects.toThrow(ForbiddenException);
    });

    it('should delegate to AdminService and return token', async () => {
      const result = await controller.exchangeHandoffCode('valid-code');
      expect(adminService.exchangeHandoffCode).toHaveBeenCalledWith('valid-code');
      expect(result).toEqual({ token: 'test-token' });
    });
  });
});
