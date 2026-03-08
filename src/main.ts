import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

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

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('Multi-Free Quota Orchestrator API')
    .setDescription('API documentation for Multi-Free Quota Orchestrator')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 配置静态文件服务
  const express = require('express');
  app.use(express.static(join(__dirname, '..', 'unified-ui', 'dist')));

  // 处理所有其他路由，返回前端 index.html
  app.getHttpAdapter().get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'unified-ui', 'dist', 'index.html'));
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap application', err);
  process.exit(1);
});

