import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

type LoginDto = {
  username: string;
  password: string;
};

function bearerFromHeader(authHeader: unknown): string | null {
  if (typeof authHeader !== 'string') return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this.auth.login(body?.username ?? '', body?.password ?? '');
    return { ok: true, token: result.token, expiresAt: result.expiresAt };
  }

  @Get('me')
  async me(@Req() req: any) {
    const token = bearerFromHeader(req?.headers?.authorization);
    const session = token ? await this.auth.getSession(token) : null;
    if (!session) return { ok: false };
    return { ok: true, username: session.username, expiresAt: session.expiresAt };
  }

  @Post('logout')
  logout(@Req() req: any) {
    const token = bearerFromHeader(req?.headers?.authorization);
    if (token) this.auth.logout(token);
    return { ok: true };
  }
}

