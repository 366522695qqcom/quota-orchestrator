import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum ProviderType {
  VERCEL = 'vercel',
  CLOUDFLARE = 'cloudflare',
  NETLIFY = 'netlify',
  RENDER = 'render',
}

export class CreateProviderConfigDto {
  @IsEnum(ProviderType)
  @IsNotEmpty()
  provider: ProviderType = ProviderType.VERCEL;

  @IsString()
  @IsNotEmpty()
  accountId: string = '';

  @IsString()
  @IsNotEmpty()
  apiToken: string = '';

  @IsOptional()
  @IsObject()
  extra?: Record<string, any> = {};
}

export class UpdateProviderConfigDto {
  @IsOptional()
  @IsString()
  apiToken?: string = undefined;

  @IsOptional()
  @IsObject()
  extra?: Record<string, any> = undefined;
}

export class QuotaRuleDto {
  @IsString()
  @IsNotEmpty()
  metricName: string = '';

  @IsNotEmpty()
  limitValue: number = 0;

  @IsNotEmpty()
  warningThreshold: number = 0;

  @IsNotEmpty()
  criticalThreshold: number = 0;

  @IsNotEmpty()
  stopThreshold: number = 0;
}