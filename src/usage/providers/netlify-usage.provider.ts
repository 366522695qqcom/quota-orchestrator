import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  UsageProvider,
  UsageProviderConfig,
  UsageSnapshot,
} from '../usage.provider';

@Injectable()
export class NetlifyUsageProvider implements UsageProvider {
  canHandle(provider: any): boolean {
    return provider === 'netlify';
  }

  async fetchUsage(config: UsageProviderConfig): Promise<UsageSnapshot> {
    const accountSlug = config.extra?.accountSlug;

    const url = `https://api.netlify.com/api/v1/accounts/${accountSlug}/billing_info`;

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        'User-Agent': 'FreeQuotaOrchestrator',
      },
    });

    const data = res.data as any;

    const plan = data?.plan || 'unknown';
    const isFreePlan = String(plan).toLowerCase().includes('free');

    const now = new Date();

    return {
      provider: 'netlify',
      accountId: config.accountId,
      periodStart: now,
      periodEnd: now,
      metrics: {
        is_free_plan: isFreePlan,
        plan_name: plan,
      },
      raw: data,
    };
  }
}

