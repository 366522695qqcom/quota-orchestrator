export type ProviderType = 'vercel' | 'cloudflare' | 'netlify' | 'render';

export interface UsageSnapshot {
  provider: ProviderType;
  accountId: string;
  periodStart: Date;
  periodEnd: Date;
  metrics: Record<string, number | string | boolean>;
  raw: any;
}

export interface UsageProviderConfig {
  provider: ProviderType;
  accountId: string;
  apiToken: string;
  extra?: Record<string, any>;
}

export interface UsageProvider {
  canHandle(provider: ProviderType): boolean;
  fetchUsage(config: UsageProviderConfig): Promise<UsageSnapshot>;
}

