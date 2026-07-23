import { ExecutionContext, ForbiddenException, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PreventImpersonationInterceptor } from './prevent-impersonation.interceptor';
import { PREVENT_IMPERSONATION_KEY, ALLOW_IMPERSONATION_KEY } from './prevent-impersonation.decorator';
import { of } from 'rxjs';

describe('PreventImpersonationInterceptor', () => {
  let interceptor: PreventImpersonationInterceptor;
  let reflector: jest.Mocked<Reflector>;
  let next: CallHandler;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    interceptor = new PreventImpersonationInterceptor(reflector);
    next = {
      handle: jest.fn().mockReturnValue(of('next')),
    };
  });

  function createMockContext(method: string, isImpersonating: boolean) {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          user: isImpersonating ? { isImpersonating: true } : { isImpersonating: false },
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow request if user is not impersonating', () => {
    const context = createMockContext('POST', false);
    expect(interceptor.intercept(context, next)).toBeDefined();
    expect(next.handle).toHaveBeenCalled();
  });

  it('should allow GET request if user is impersonating and endpoint is not decorated with PreventImpersonation', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('GET', true);
    expect(interceptor.intercept(context, next)).toBeDefined();
    expect(next.handle).toHaveBeenCalled();
  });

  it('should block GET request if endpoint is decorated with PreventImpersonation', () => {
    reflector.getAllAndOverride.mockImplementation((key) => key === PREVENT_IMPERSONATION_KEY);
    const context = createMockContext('GET', true);
    expect(() => interceptor.intercept(context, next)).toThrow(ForbiddenException);
  });

  it('should globally block POST request if user is impersonating', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('POST', true);
    expect(() => interceptor.intercept(context, next)).toThrow(ForbiddenException);
  });

  it('should globally block DELETE request if user is impersonating', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('DELETE', true);
    expect(() => interceptor.intercept(context, next)).toThrow(ForbiddenException);
  });

  it('should allow POST request if user is impersonating but endpoint has AllowImpersonationMutation', () => {
    reflector.getAllAndOverride.mockImplementation((key) => key === ALLOW_IMPERSONATION_KEY);
    const context = createMockContext('POST', true);
    expect(interceptor.intercept(context, next)).toBeDefined();
    expect(next.handle).toHaveBeenCalled();
  });
});
