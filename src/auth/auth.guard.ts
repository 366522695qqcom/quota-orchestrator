import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

function bearerFromHeader(authHeader: unknown): string | null {
  if (typeof authHeader !== 'string') return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const req = context.switchToHttp().getRequest();
    const token = bearerFromHeader(req?.headers?.authorization);
    if (!token) return false;
    const session = this.auth.getSession(token);
    if (!session) return false;
    req.user = { username: session.username };
    return true;
  }
}

