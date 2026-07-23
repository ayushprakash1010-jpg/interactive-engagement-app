import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PREVENT_IMPERSONATION_KEY, ALLOW_IMPERSONATION_KEY } from './prevent-impersonation.decorator';
import { AuthenticatedUser } from './jwt.strategy';

@Injectable()
export class PreventImpersonationInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (user?.isImpersonating) {
      const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase());
      const preventImpersonation = this.reflector.getAllAndOverride<boolean>(PREVENT_IMPERSONATION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      const allowImpersonation = this.reflector.getAllAndOverride<boolean>(ALLOW_IMPERSONATION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (preventImpersonation || (isMutation && !allowImpersonation)) {
        throw new ForbiddenException('This action cannot be performed while impersonating another user.');
      }
    }

    return next.handle();
  }
}
