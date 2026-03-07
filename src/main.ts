import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  app.enableCors({
    origin: isDevelopment
      ? [
          /^http:\/\/localhost:\d+$/,
          /^http:\/\/127\.0\.0\.1:\d+$/,
        ]
      : process.env.ALLOWED_ORIGINS?.split(',') || [],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap application', err);
  process.exit(1);
});

