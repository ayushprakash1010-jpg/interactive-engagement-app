import { RateLimitService } from './rate-limit.service';

function makeService(opts?: { window?: number; max?: number }) {
  const store = new Map<string, number>();
  const client = {
    incr: jest.fn(async (key: string) => {
      const next = (store.get(key) ?? 0) + 1;
      store.set(key, next);
      return next;
    }),
    expire: jest.fn(async () => 1),
    ttl: jest.fn(async () => 30),
  };

  const config = {
    get: jest.fn((key: string) =>
      key === 'RATE_LIMIT_WINDOW' ? (opts?.window ?? 60) : (opts?.max ?? 3),
    ),
  };

  const service = new RateLimitService(
    { client } as any,
    config as any,
  );
  return { service, client };
}

describe('RateLimitService', () => {
  it('allows requests up to the limit then blocks', async () => {
    const { service } = makeService({ max: 3 });

    expect((await service.consume('bucket')).allowed).toBe(true); // 1
    expect((await service.consume('bucket')).allowed).toBe(true); // 2
    expect((await service.consume('bucket')).allowed).toBe(true); // 3
    const fourth = await service.consume('bucket');
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfter).toBeGreaterThan(0);
  });

  it('sets a TTL only on the first hit of a window', async () => {
    const { service, client } = makeService({ max: 5 });
    await service.consume('bucket');
    await service.consume('bucket');
    expect(client.expire).toHaveBeenCalledTimes(1);
  });

  it('tracks separate buckets independently', async () => {
    const { service } = makeService({ max: 1 });
    expect((await service.consume('a')).allowed).toBe(true);
    expect((await service.consume('a')).allowed).toBe(false);
    expect((await service.consume('b')).allowed).toBe(true);
  });

  it('fails open if Redis throws', async () => {
    const { service, client } = makeService({ max: 1 });
    client.incr.mockRejectedValueOnce(new Error('redis down'));
    const result = await service.consume('bucket');
    expect(result.allowed).toBe(true);
  });

  it('consumeForAction blocks when the per-anon bucket is exhausted', async () => {
    const { service } = makeService({ max: 2 });
    expect((await service.consumeForAction('qa:ask', 'anon1', '1.1.1.1')).allowed).toBe(
      true,
    );
    expect((await service.consumeForAction('qa:ask', 'anon1', '1.1.1.1')).allowed).toBe(
      true,
    );
    expect((await service.consumeForAction('qa:ask', 'anon1', '1.1.1.1')).allowed).toBe(
      false,
    );
  });
});
