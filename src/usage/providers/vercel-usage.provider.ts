import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  UsageProvider,
  UsageProviderConfig,
  UsageSnapshot,
} from '../usage.provider';

@Injectable()
export class VercelUsageProvider implements UsageProvider {
  canHandle(provider: any): boolean {
    return provider === 'vercel';
  }

  async fetchUsage(config: UsageProviderConfig): Promise<UsageSnapshot> {
    const res = await axios.get('https://api.vercel.com/v2/usage', {
      headers: { Authorization: `Bearer ${config.apiToken}` },
    });

    const data = res.data as any;

    const metrics = {
      // 具体字段需根据实际返回结构调整
      requests: data?.requests?.total ?? 0,
      bandwidth_mb: data?.bandwidth?.totalMb ?? 0,
      function_ms: data?.functions?.totalMs ?? 0,
    };

    const now = new Date();

    return {
      provider: 'vercel',
      accountId: config.accountId,
      periodStart: now,
      periodEnd: now,
      metrics,
      raw: data,
    };
  }
}

