import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  root() {
    return {
      ok: true,
      message_en: 'Service is running.',
      message_zh: '服务正在运行。',
      endpoints: {
        health: '/api/health',
        login: '/api/auth/login (POST)',
        usageTest: '/api/usage/test (POST)',
      },
    };
  }

  @Public()
  @Get('health')
  health() {
    return { ok: true };
  }
}

