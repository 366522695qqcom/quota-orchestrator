import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  UsageProvider,
  UsageProviderConfig,
  UsageSnapshot,
} from '../usage.provider';

@Injectable()
export class CloudflareUsageProvider implements UsageProvider {
  canHandle(provider: any): boolean {
    return provider === 'cloudflare';
  }

  async fetchUsage(config: UsageProviderConfig): Promise<UsageSnapshot> {
    const accountTag = config.extra?.accountTag;

    const query = `
      query {
        viewer {
          accounts(filter: {accountTag: "${accountTag}"}) {
            workersInvocationsAdaptive(limit: 1) {
              sum {
                requests
              }
            }
          }
        }
      }
    `;

    const res = await axios.post(
      'https://api.cloudflare.com/client/v4/graphql',
      { query },
      {
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = res.data as any;

    const requests =
      data?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive?.[0]?.sum
        ?.requests ?? 0;

    const now = new Date();

    return {
      provider: 'cloudflare',
      accountId: config.accountId,
      periodStart: now,
      periodEnd: now,
      metrics: {
        workers_requests: requests,
      },
      raw: data,
    };
  }
}

