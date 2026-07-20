import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UserEntity } from './user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let model: any;

  beforeEach(async () => {
    // Mock the Mongoose model
    model = {
      findOneAndUpdate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({ _id: '123', auth0Sub: 'auth0|123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(UserEntity.name),
          useValue: model,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Mock Date.now to control time
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should append lastActiveAt on the first upsert and cache it', async () => {
    await service.upsert({ auth0Sub: 'auth0|123', name: 'Test', email: 'test@test.com' });

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { auth0Sub: 'auth0|123' },
      expect.objectContaining({
        $set: expect.objectContaining({
          lastActiveAt: expect.any(Date),
        }),
      }),
      expect.any(Object),
    );
  });

  it('should throttle lastActiveAt updates within a 15-minute window', async () => {
    // First call updates activity
    await service.upsert({ auth0Sub: 'auth0|123', name: 'Test', email: 'test@test.com' });
    model.findOneAndUpdate.mockClear();

    // Advance time by 5 minutes (within 15m window)
    jest.advanceTimersByTime(5 * 60 * 1000);
    await service.upsert({ auth0Sub: 'auth0|123', name: 'Test', email: 'test@test.com' });

    // Ensure lastActiveAt is NOT in the $set payload
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { auth0Sub: 'auth0|123' },
      expect.objectContaining({
        $set: expect.not.objectContaining({
          lastActiveAt: expect.any(Date),
        }),
      }),
      expect.any(Object),
    );
  });

  it('should update lastActiveAt again after the 15-minute window expires', async () => {
    // First call
    await service.upsert({ auth0Sub: 'auth0|123', name: 'Test', email: 'test@test.com' });
    model.findOneAndUpdate.mockClear();

    // Advance time by 16 minutes (outside window)
    jest.advanceTimersByTime(16 * 60 * 1000);
    await service.upsert({ auth0Sub: 'auth0|123', name: 'Test', email: 'test@test.com' });

    // Should include lastActiveAt again
    // Should include lastActiveAt again
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { auth0Sub: 'auth0|123' },
      expect.objectContaining({
        $set: expect.objectContaining({
          lastActiveAt: expect.any(Date),
        }),
      }),
      expect.any(Object),
    );
  });

  it('should not overwrite profile when skipProfileUpdate is true', async () => {
    await service.upsert({ auth0Sub: 'auth0|123', name: 'Test', email: 'test@test.com' }, { skipProfileUpdate: true });
    
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { auth0Sub: 'auth0|123' },
      expect.objectContaining({
        $set: expect.not.objectContaining({
          name: 'Test',
          email: 'test@test.com'
        }),
        $setOnInsert: expect.objectContaining({
          name: 'Test',
          email: 'test@test.com'
        })
      }),
      expect.any(Object),
    );
  });
});
