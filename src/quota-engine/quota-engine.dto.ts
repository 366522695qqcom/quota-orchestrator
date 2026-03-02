import { IsInt, IsOptional, IsNumber, Max } from 'class-validator';

export class CreateQuotaRuleDto {
  metricName: string;

  @IsNumber()
  @IsOptional()
  limitValue?: number;

  @IsNumber()
  @IsOptional()
  warningThreshold?: number;

  @IsNumber()
  @IsOptional()
  criticalThreshold?: number;

  @IsNumber()
  @IsOptional()
  stopThreshold?: number;
}

export class UpdateQuotaRuleDto {
  @IsNumber()
  @IsOptional()
  limitValue?: number;

  @IsNumber()
  @IsOptional()
  warningThreshold?: number;

  @IsNumber()
  @IsOptional()
  criticalThreshold?: number;

  @IsNumber()
  @IsOptional()
  stopThreshold?: number;
}