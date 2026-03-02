import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ProviderConfigService } from '../provider-config/provider-config.service';
import axios from 'axios';

export interface ServiceControlOptions {
  provider: string;
  accountId: string;
  configId: string;
  action: 'STOP' | 'START' | 'RESTART';
  reason: string;
  executedBy: string;
  scheduledAt?: Date;
}

@Injectable()
export class ServiceControlService {
  private readonly logger = new Logger(ServiceControlService.name);

  constructor(
    private prisma: PrismaService,
    private providerConfigService: ProviderConfigService,
  ) {}

  async executeControl(options: ServiceControlOptions): Promise<void> {
    const { provider, accountId, configId, action, reason, executedBy, scheduledAt } = options;

    this.logger.log(`Executing ${action} for ${provider}/${accountId}`);

    const apiToken = await this.providerConfigService.getDecryptedToken(configId, executedBy);

    try {
      switch (provider) {
        case 'vercel':
          await this.controlVercel(accountId, apiToken, action);
          break;
        case 'cloudflare':
          await this.controlCloudflare(accountId, apiToken, action);
          break;
        case 'netlify':
          await this.controlNetlify(accountId, apiToken, action);
          break;
        case 'render':
          await this.controlRender(accountId, apiToken, action);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      await this.prisma.serviceControl.create({
        data: {
          provider: provider as any,
          accountId,
          configId,
          action: action as any,
          reason,
          executedBy,
          scheduledAt,
        },
      });

      this.logger.log(`Successfully executed ${action} for ${provider}/${accountId}`);
    } catch (error) {
      this.logger.error(
        `Failed to execute ${action} for ${provider}/${accountId}`,
        error,
      );
      throw error;
    }
  }

  private async controlVercel(
    accountId: string,
    apiToken: string,
    action: 'STOP' | 'START' | 'RESTART',
  ): Promise<void> {
    const projectId = accountId;
    
    if (action === 'STOP') {
      await axios.patch(
        `https://api.vercel.com/v12/projects/${projectId}`,
        { suspended: true },
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      );
    } else if (action === 'START') {
      await axios.patch(
        `https://api.vercel.com/v12/projects/${projectId}`,
        { suspended: false },
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      );
    } else if (action === 'RESTART') {
      await axios.post(
        `https://api.vercel.com/v12/projects/${projectId}/deployments`,
        {},
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      );
    }
  }

  private async controlCloudflare(
    accountId: string,
    apiToken: string,
    action: 'STOP' | 'START' | 'RESTART',
  ): Promise<void> {
    const scriptId = accountId;
    
    if (action === 'STOP') {
      await axios.put(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptId}`,
        { script: '' },
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      );
    } else if (action === 'START' || action === 'RESTART') {
      const script = await this.getCloudflareScript(accountId, scriptId, apiToken);
      await axios.put(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptId}`,
        { script },
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      );
    }
  }

  private async getCloudflareScript(
    accountId: string,
    scriptId: string,
    apiToken: string,
  ): Promise<string> {
    const res = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptId}`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
      },
    );
    return res.data.script || '';
  }

  private async controlNetlify(
    accountId: string,
    apiToken: string,
    action: 'STOP' | 'START' | 'RESTART',
  ): Promise<void> {
    const siteId = accountId;
    
    if (action === 'STOP') {
      await axios.patch(
        `https://api.netlify.com/api/v1/sites/${siteId}`,
        { processing_settings: { skip: true } },
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      );
    } else if (action === 'START') {
      await axios.patch(
        `https://api.netlify.com/api/v1/sites/${siteId}`,
        { processing_settings: { skip: false } },
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      );
    } else if (action === 'RESTART') {
      await axios.post(
        `https://api.netlify.com/api/v1/sites/${siteId}/builds`,
        {},
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      );
    }
  }

  private async controlRender(
    accountId: string,
    apiToken: string,
    action: 'STOP' | 'START' | 'RESTART',
  ): Promise<void> {
    const serviceId = accountId;
    
    if (action === 'STOP') {
      await axios.post(
        `https://api.render.com/v0/services/${serviceId}/stop`,
        {},
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      );
    } else if (action === 'START') {
      await axios.post(
        `https://api.render.com/v0/services/${serviceId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      );
    } else if (action === 'RESTART') {
      await this.controlRender(accountId, apiToken, 'STOP');
      await this.controlRender(accountId, apiToken, 'START');
    }
  }

  async scheduleRecovery(
    configId: string,
    scheduledFor: Date,
  ): Promise<void> {
    const config = await this.prisma.providerConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      throw new Error('Provider config not found');
    }

    await this.prisma.scheduledRecovery.create({
      data: {
        provider: config.provider,
        accountId: config.accountId,
        configId,
        scheduledFor,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Scheduled recovery for ${config.provider}/${config.accountId} at ${scheduledFor}`,
    );
  }

  async cancelRecovery(recoveryId: string): Promise<void> {
    await this.prisma.scheduledRecovery.update({
      where: { id: recoveryId },
      data: { status: 'CANCELLED' },
    });
  }

  async getScheduledRecoveries(configId: string) {
    return this.prisma.scheduledRecovery.findMany({
      where: { configId, status: 'PENDING' },
      orderBy: { scheduledFor: 'asc' },
    });
  }
}