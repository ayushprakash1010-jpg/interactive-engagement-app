import { Test } from '@nestjs/testing';
import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis.health';
import { GeminiProvider } from '../ai/gemini.provider';

describe('HealthController', () => {
  let controller: HealthController;
  const healthCheck = jest.fn();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: { check: healthCheck } },
        { provide: MongooseHealthIndicator, useValue: { pingCheck: jest.fn() } },
        { provide: RedisHealthIndicator, useValue: { pingCheck: jest.fn() } },
        { 
          provide: GeminiProvider, 
          useValue: { 
            limiter: { queued: jest.fn(), running: jest.fn(), currentReservoir: jest.fn().mockResolvedValue(14), empty: jest.fn() } 
          } 
        },
      ],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  afterEach(() => jest.clearAllMocks());

  it('aggregates the mongo and redis indicators', async () => {
    healthCheck.mockResolvedValue({ status: 'ok' });
    const result = await controller.check();
    expect(result).toEqual({ status: 'ok' });
    expect(healthCheck).toHaveBeenCalledWith([
      expect.any(Function),
      expect.any(Function),
    ]);
  });
});
