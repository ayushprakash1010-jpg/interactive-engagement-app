import { Test, TestingModule } from '@nestjs/testing';
import { SupportService } from './support.service';
import { getModelToken } from '@nestjs/mongoose';
import { AdminService } from '../admin/admin.service';
import { UsersService } from '../users/users.service';

describe('SupportService', () => {
  let service: SupportService;

  const mockModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockAdminService = {
    createAuditLog: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        {
          provide: getModelToken('SupportTicketEntity'),
          useValue: mockModel,
        },
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<SupportService>(SupportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
