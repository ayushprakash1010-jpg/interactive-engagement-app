import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import type { AppRole } from './roles.decorator';

function makeContext(role?: 'host' | 'admin'): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function makeGuard(required: AppRole[] | undefined): RolesGuard {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(required),
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('allows routes with no @Roles metadata', () => {
    expect(makeGuard(undefined).canActivate(makeContext('host'))).toBe(true);
    expect(makeGuard([]).canActivate(makeContext())).toBe(true);
  });

  it('allows a user whose role is in the required set', () => {
    expect(makeGuard(['admin']).canActivate(makeContext('admin'))).toBe(true);
    expect(
      makeGuard(['host', 'admin']).canActivate(makeContext('host')),
    ).toBe(true);
  });

  it('rejects a user whose role is not allowed', () => {
    expect(() =>
      makeGuard(['admin']).canActivate(makeContext('host')),
    ).toThrow(ForbiddenException);
  });

  it('rejects an unauthenticated request (no user)', () => {
    expect(() => makeGuard(['admin']).canActivate(makeContext())).toThrow(
      ForbiddenException,
    );
  });
});
