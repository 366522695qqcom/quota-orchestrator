import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import {
  CreateProviderConfigDto,
  UpdateProviderConfigDto,
  QuotaRuleDto,
} from './provider-config.dto';
import { UsageProviderConfig, UsageSnapshot, ProviderType } from '../usage/usage.provider';
import { VercelUsageProvider } from '../usage/providers/vercel-usage.provider';

@Injectable()
export class ProviderConfigService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  async create(userId: string, dto: CreateProviderConfigDto) {
    const encryptedToken = this.encryption.encrypt(dto.apiToken);
    const extra = dto.extra ? JSON.stringify(dto.extra) : undefined;
    return this.prisma.providerConfig.create({
      data: {
        provider: dto.provider as any,
        accountId: dto.accountId,
        apiToken: encryptedToken,
        extra: extra,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    const configs = await this.prisma.providerConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        quotaRules: true,
      },
    });

    return configs.map((config) => ({
      ...config,
      apiToken: '***',
    }));
  }

  async findOne(id: string, userId: string) {
    const config = await this.prisma.providerConfig.findFirst({
      where: { id, userId },
      include: {
        quotaRules: true,
      },
    });

    if (!config) {
      throw new NotFoundException('Provider config not found');
    }

    return {
      ...config,
      apiToken: '***',
    };
  }

  async getDecryptedToken(id: string, userId: string): Promise<string> {
    const config = await this.prisma.providerConfig.findFirst({
      where: { id, userId },
    });

    if (!config) {
      throw new NotFoundException('Provider config not found');
    }

    return this.encryption.decrypt(config.apiToken);
  }

  async update(id: string, userId: string, dto: UpdateProviderConfigDto) {
    const updateData: any = {};

    if (dto.apiToken) {
      updateData.apiToken = this.encryption.encrypt(dto.apiToken);
    }

    if (dto.extra !== undefined) {
      updateData.extra = dto.extra;
    }

    return this.prisma.providerConfig.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    const config = await this.prisma.providerConfig.findFirst({
      where: { id, userId },
    });

    if (!config) {
      throw new NotFoundException('Provider config not found');
    }

    await this.prisma.providerConfig.delete({
      where: { id },
    });
  }

  async createQuotaRule(configId: string, userId: string, dto: QuotaRuleDto) {
    const config = await this.prisma.providerConfig.findFirst({
      where: { id: configId, userId },
    });

    if (!config) {
      throw new NotFoundException('Provider config not found');
    }

    return this.prisma.quotaRule.create({
      data: {
        provider: config.provider,
        accountId: config.accountId,
        configId,
        metricName: dto.metricName,
        limitValue: dto.limitValue,
        warningThreshold: dto.warningThreshold,
        criticalThreshold: dto.criticalThreshold,
        stopThreshold: dto.stopThreshold,
      },
    });
  }

  async getQuotaRules(configId: string, userId: string) {
    const config = await this.prisma.providerConfig.findFirst({
      where: { id: configId, userId },
    });

    if (!config) {
      throw new NotFoundException('Provider config not found');
    }

    return this.prisma.quotaRule.findMany({
      where: { configId },
    });
  }

  async updateQuotaRule(id: string, userId: string, dto: Partial<QuotaRuleDto>) {
    const rule = await this.prisma.quotaRule.findFirst({
      where: { id },
      include: { config: true },
    });

    if (!rule || rule.config.userId !== userId) {
      throw new NotFoundException('Quota rule not found');
    }

    return this.prisma.quotaRule.update({
      where: { id },
      data: dto,
    });
  }

  async deleteQuotaRule(id: string, userId: string) {
    const rule = await this.prisma.quotaRule.findFirst({
      where: { id },
      include: { config: true },
    });

    if (!rule || rule.config.userId !== userId) {
      throw new NotFoundException('Quota rule not found');
    }

    await this.prisma.quotaRule.delete({
      where: { id },
    });
  }

  async testConfig(id: string, userId: string) {
    const config = await this.prisma.providerConfig.findFirst({
      where: { id, userId },
      include: {
        quotaRules: true,
      },
    });

    if (!config) {
      throw new NotFoundException('Provider config not found');
    }

    const apiToken = await this.getDecryptedToken(id, userId);

    const providerConfig: UsageProviderConfig = {
      provider: config.provider as ProviderType,
      accountId: config.accountId,
      apiToken,
      extra: config.extra as any,
    };

    const provider = new VercelUsageProvider();

    try {
      const snapshot: UsageSnapshot = await provider.fetchUsage(providerConfig);
      return { ok: true, snapshot };
    } catch (error: any) {
      throw new BadRequestException(`Test failed: ${error.message}`);
    }
  }

  async cancelConfig(id: string, userId: string) {
    const config = await this.prisma.providerConfig.findFirst({
      where: { id, userId },
    });

    if (!config) {
      throw new NotFoundException('Provider config not found');
    }

    await this.prisma.providerConfig.delete({
      where: { id },
    });
  }
}