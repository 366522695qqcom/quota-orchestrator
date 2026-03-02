import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  UsageProviderConfig,
  UsageSnapshot,
  ProviderType,
} from './usage.provider';
import { VercelUsageProvider } from './providers/vercel-usage.provider';
import { CloudflareUsageProvider } from './providers/cloudflare-usage.provider';
import { NetlifyUsageProvider } from './providers/netlify-usage.provider';
import { RenderUsageProvider } from './providers/render-usage.provider';
import { PrismaService } from '../database/prisma.service';
import { ProviderConfigService } from '../provider-config/provider-config.service';
import { QuotaEngineService } from '../quota-engine/quota-engine.service';
import { ServiceControlService } from '../service-control/service-control.service';
import { LoggerService } from '../logger/logger.service';
import { RetryService } from '../retry/retry.service';

@Injectable()
export class UsageService {
  private readonly logger: LoggerService;

  private readonly providers;

  constructor(
    vercel: VercelUsageProvider,
    cloudflare: CloudflareUsageProvider,
    netlify: NetlifyUsageProvider,
    render: RenderUsageProvider,
    private prisma: PrismaService,
    private providerConfigService: ProviderConfigService,
    private quotaEngine: QuotaEngineService,
    private serviceControl: ServiceControlService,
    private loggerService: LoggerService,
    private retryService: RetryService,
  ) {
    this.logger = loggerService;
    this.providers = [vercel, cloudflare, netlify, render];
  }

  private resolveProvider(type: ProviderType): UsageProvider {
    const provider = this.providers.find((p) => p.canHandle(type));
    if (!provider) {
      throw new Error(`No UsageProvider registered for type ${type}`);
    }
    return provider;
  }

  async fetchOnce(configId: string, userId: string): Promise<UsageSnapshot> {
    const config = await this.prisma.providerConfig.findUnique({
      where: { id: configId, userId },
    });

    if (!config) {
      throw new Error('Provider config not found');
    }

    const apiToken = await this.providerConfigService.getDecryptedToken(configId, userId);

    const providerConfig: UsageProviderConfig = {
      provider: config.provider as any,
      accountId: config.accountId,
      apiToken,
      extra: config.extra as any,
    };

    const provider = this.resolveProvider(providerConfig.provider);
    const snapshot = await this.retryService.executeWithRetry(
      async () => provider.fetchUsage(providerConfig),
      (error) => {
        return error?.code === 'ECONNRESET' || 
               error?.code === 'ETIMEDOUT' ||
               error?.response?.status >= 500;
      },
      { maxAttempts: 3, delayMs: 1000 },
    );

    await this.prisma.usageSnapshot.create({
      data: {
        provider: snapshot.provider,
        accountId: snapshot.accountId,
        configId,
        periodStart: snapshot.periodStart,
        periodEnd: snapshot.periodEnd,
        metrics: snapshot.metrics as any,
        raw: snapshot.raw as any,
      },
    });

    const quotaCheck = await this.quotaEngine.checkQuota(configId, snapshot);

    if (!quotaCheck.ok) {
      this.logger.warn(
        `Quota exceeded for ${config.provider}/${config.accountId}, stopping service...`,
      );
      await this.retryService.executeWithRetry(
        async () => this.serviceControl.executeControl({
          provider: config.provider,
          accountId: config.accountId,
          configId,
          action: 'STOP',
          reason: 'Quota exceeded',
          executedBy: 'system',
        }),
        (error) => error?.code === 'ECONNRESET' || 
                  error?.code === 'ETIMEDOUT' ||
                  error?.response?.status >= 500,
        { maxAttempts: 3, delayMs: 2000 },
      );
    }

    return snapshot;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async pollAllAccounts() {
    this.logger.log('Starting usage polling...');

    const configs = await this.prisma.providerConfig.findMany({
      where: { userId: { not: null } },
    });

    if (!configs.length) {
      this.logger.debug('No accounts configured for usage polling yet.');
      return;
    }

    this.logger.log(`Polling usage for ${configs.length} accounts...`);

    for (const config of configs) {
      try {
        await this.fetchOnce(config.id, config.userId!);
      } catch (error: any) {
        this.logger.error(
          `Failed to fetch usage for ${config.provider}/${config.accountId}: ${error?.message}`,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkScheduledRecoveries() {
    this.logger.log('Checking scheduled recoveries...');

    const pendingRecoveries = await this.prisma.scheduledRecovery.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: new Date() },
      },
    });

    for (const recovery of pendingRecoveries) {
      try {
        await this.serviceControl.executeControl({
          provider: recovery.provider,
          accountId: recovery.accountId,
          configId: recovery.configId,
          action: 'START',
          reason: 'Scheduled recovery',
          executedBy: 'system',
        });

        await this.prisma.scheduledRecovery.update({
          where: { id: recovery.id },
          data: {
            status: 'COMPLETED',
            executedAt: new Date(),
          },
        });

        this.logger.log(
          `Completed scheduled recovery for ${recovery.provider}/${recovery.accountId}`,
        );
      } catch (error: any) {
        this.logger.error(
          `Failed to execute scheduled recovery for ${recovery.provider}/${recovery.accountId}: ${error?.message}`,
        );

        await this.prisma.scheduledRecovery.update({
          where: { id: recovery.id },
          data: { status: 'FAILED' },
        });
      }
    }
  }

  async getHistory(configId: string, userId: string, limit = 50) {
    const config = await this.prisma.providerConfig.findFirst({
      where: { id: configId, userId },
    });

    if (!config) {
      throw new Error('Provider config not found');
    }

    return this.prisma.usageSnapshot.findMany({
      where: { configId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAlerts(configId: string, userId: string, limit = 50) {
    const config = await this.prisma.providerConfig.findFirst({
      where: { id: configId, userId },
    });

    if (!config) {
      throw new Error('Provider config not found');
    }

    return this.prisma.alert.findMany({
      where: { configId },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });
  }

  async getServiceControls(configId: string, userId: string, limit = 50) {
    const config = await this.prisma.providerConfig.findFirst({
      where: { id: configId, userId },
    });

    if (!config) {
      throw new Error('Provider config not found');
    }

    return this.prisma.serviceControl.findMany({
      where: { configId },
      orderBy: { executedAt: 'desc' },
      take: limit,
    });
  }
}