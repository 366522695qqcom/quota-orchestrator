import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../database/prisma.service';

export interface AlertData {
  provider: string;
  accountId: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  level: 'WARNING' | 'CRITICAL' | 'STOPPED';
  message: string;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
  ) {}

  private async getSmtpConfig(userId: string) {
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
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      from: config.from,
    };
  }

  private createTransporter(config: any) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  async sendAlert(userId: string, alert: AlertData): Promise<void> {
    const config = await this.getSmtpConfig(userId);
    this.createTransporter(config);

    const subject = `[${alert.level}] ${alert.provider} - ${alert.accountId} 额度告警`;
    const html = `
      <h2>${alert.level} 告警</h2>
      <p><strong>Provider:</strong> ${alert.provider}</p>
      <p><strong>Account ID:</strong> ${alert.accountId}</p>
      <p><strong>指标:</strong> ${alert.metricName}</p>
      <p><strong>当前值:</strong> ${alert.currentValue}</p>
      <p><strong>阈值:</strong> ${alert.threshold}</p>
      <p><strong>消息:</strong> ${alert.message}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        此邮件由 Quota Orchestrator 自动发送<br>
        时间: ${new Date().toLocaleString('zh-CN')}
      </p>
    `;
    try {
      await this.transporter.sendMail({
        from: config.from,
        to: config.user,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send alert email:', error);
      throw error;
    }
  }

  async sendTestEmail(userId: string): Promise<void> {
    const config = await this.getSmtpConfig(userId);
    this.createTransporter(config);

    const subject = 'Quota Orchestrator 测试邮件';
    const html = `
      <h2>测试邮件</h2>
      <p>如果您收到此邮件，说明邮件配置正确！</p>
      <p>时间: ${new Date().toLocaleString('zh-CN')}</p>
    `;
    await this.transporter.sendMail({
      from: config.from,
      to: config.user,
      subject,
      html,
    });
  }
}