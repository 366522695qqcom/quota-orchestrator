import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  UsageProvider,
  UsageProviderConfig,
  UsageSnapshot,
} from '../usage.provider';

interface RenderService {
  id: string;
  serviceDetails?: {
    createdAt?: string;
    updatedAt?: string;
  };
}

@Injectable()
export class RenderUsageProvider implements UsageProvider {
  canHandle(provider: any): boolean {
    return provider === 'render';
  }

  async fetchUsage(config: UsageProviderConfig): Promise<UsageSnapshot> {
    const res = await axios.get<RenderService[]>(
      'https://api.render.com/v0/services',
      {
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
        },
      },
    );

    const services = res.data ?? [];
    const now = new Date();

    let totalRunningHours = 0;

    for (const svc of services) {
      const createdAt = svc.serviceDetails?.createdAt;
      if (createdAt) {
        const created = new Date(createdAt);
        const diffMs = now.getTime() - created.getTime();
        totalRunningHours += diffMs / (1000 * 60 * 60);
      }
    }

    return {
      provider: 'render',
      accountId: config.accountId,
      periodStart: now, // 这里只是估算，如需精确可根据账单周期调整
      periodEnd: now,
      metrics: {
        total_running_hours: Number(totalRunningHours.toFixed(2)),
        services_count: services.length,
      },
      raw: services,
    };
  }
}

