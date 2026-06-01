// apps/api/src/auth/jwt-auth.guard.spec.ts
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard.handleRequest', () => {
  const guard = new JwtAuthGuard();

  it('returns the user when verification succeeds', () => {
    const user = { _id: 'abc', role: 'host' };
    expect(guard.handleRequest(null, user, null)).toBe(user);
  });

  it('throws 401 when no user is present (missing token)', () => {
    expect(() => guard.handleRequest(null, false, 'No auth token')).toThrow(
      UnauthorizedException,
    );
  });

  it('throws 401 when Passport reports an error (e.g. wrong audience)', () => {
    const info = new Error('jwt audience invalid');
    expect(() => guard.handleRequest(null, false, info)).toThrow(
      UnauthorizedException,
    );
  });

  it('throws 401 when validate() threw (err is set)', () => {
    const err = new Error('boom');
    expect(() => guard.handleRequest(err, false, null)).toThrow(
      UnauthorizedException,
    );
  });

  it('surfaces the failure detail in non-production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    try {
      expect(() =>
        guard.handleRequest(null, false, new Error('jwt expired')),
      ).toThrow(/jwt expired/);
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it('hides the failure detail in production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      expect(() =>
        guard.handleRequest(null, false, new Error('jwt expired')),
      ).toThrow('Unauthorized');
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});
