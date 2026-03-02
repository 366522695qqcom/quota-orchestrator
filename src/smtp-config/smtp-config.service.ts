import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SmtpConfigService {
  constructor(private prisma: PrismaService) {}

  async getConfig(userId: string) {
    const config = await this.prisma.smtpConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      return {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
        from: process.env.SMTP_FROM || 'Quota Orchestrator <noreply@example.com>',
      };
    }

    return {
      id: config.id,
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      from: config.from,
    };
  }

  async updateConfig(userId: string, data: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    from?: string;
  }) {
    const existing = await this.prisma.smtpConfig.findUnique({
      where: { userId },
    });

    if (!existing) {
      const config = await this.prisma.smtpConfig.create({
        data: {
          userId,
          host: data.host || process.env.SMTP_HOST || 'smtp.gmail.com',
          port: data.port || parseInt(process.env.SMTP_PORT || '587'),
          user: data.user || process.env.SMTP_USER || '',
          password: data.password || process.env.SMTP_PASSWORD || '',
          from: data.from || process.env.SMTP_FROM || 'Quota Orchestrator <noreply@example.com>',
        },
      });

      return config;
    }

    const config = await this.prisma.smtpConfig.update({
      where: { id: existing.id },
      data: {
        host: data.host !== undefined ? data.host : existing.host,
        port: data.port !== undefined ? data.port : existing.port,
        user: data.user !== undefined ? data.user : existing.user,
        password: data.password !== undefined ? data.password : existing.password,
        from: data.from !== undefined ? data.from : existing.from,
        updatedAt: new Date(),
      },
    });

    return config;
  }

  async deleteConfig(userId: string) {
    const config = await this.prisma.smtpConfig.findUnique({
      where: { userId },
    });

    if (!config) {
      throw new NotFoundException('SMTP config not found');
    }

    await this.prisma.smtpConfig.delete({
      where: { id: config.id },
    });
  }
}