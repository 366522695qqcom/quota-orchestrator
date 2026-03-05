import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { ProviderConfigService } from '../provider-config/provider-config.service';
import { UsageSnapshot } from '../usage/usage.provider';
import { QuotaRuleDto } from '../provider-config/provider-config.dto';

export interface QuotaCheckResult {
  ok: boolean;
  level: 'OK' | 'WARNING' | 'CRITICAL' | 'STOPPED';
  alerts: Array<{
    metricName: string;
    currentValue: number;
    threshold: number;
    level: 'WARNING' | 'CRITICAL' | 'STOPPED';
    message: string;
  }>;
}

@Injectable()
export class QuotaEngineService {
  private readonly logger: Logger;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private providerConfigService: ProviderConfigService,
  ) {
    this.logger = new Logger(QuotaEngineService.name);
  }

  async checkQuota(
    configId: string,
    snapshot: UsageSnapshot,
  ): Promise<QuotaCheckResult> {
    const config = await this.prisma.providerConfig.findUnique({
      where: { id: configId },
      include: { quotaRules: true },
    });

    if (!config) {
      throw new Error('Provider config not found');
    }

    const alerts: QuotaCheckResult['alerts'] = [];

    for (const rule of config.quotaRules) {
      const currentValue = snapshot.metrics[rule.metricName];

      if (typeof currentValue === 'number') {
        const percentage = (currentValue / rule.limitValue) * 100;

        if (percentage >= rule.stopThreshold) {
          alerts.push({
            metricName: rule.metricName,
            currentValue,
            threshold: rule.stopThreshold,
            level: 'STOPPED',
            message: `Usage has reached ${rule.stopThreshold}% of quota limit (${currentValue}/${rule.limitValue}). Service will be stopped.`,
          });
        } else if (percentage >= rule.criticalThreshold) {
          alerts.push({
            metricName: rule.metricName,
            currentValue,
            threshold: rule.criticalThreshold,
            level: 'CRITICAL',
            message: `Usage has reached ${rule.criticalThreshold}% of quota limit (${currentValue}/${rule.limitValue}). Immediate action required.`,
          });
        } else if (percentage >= rule.warningThreshold) {
          alerts.push({
            metricName: rule.metricName,
            currentValue,
            threshold: rule.warningThreshold,
            level: 'WARNING',
            message: `Usage has reached ${rule.warningThreshold}% of quota limit (${currentValue}/${rule.limitValue}). Please monitor usage.`,
          });
        }
      }
    }

    const hasStopAlert = alerts.some((alert) => alert.level === 'STOPPED');

    if (hasStopAlert) {
      try {
        await this.mailService.sendAlert(config.userId, {
          provider: config.provider,
          accountId: config.accountId,
          metricName: 'Service',
          currentValue: 0,
          threshold: 100,
          level: 'STOPPED',
          message: `Service has been stopped due to quota limit exceeded.`,
        });
      } catch (error) {
        this.logger.error('Failed to send stop alert email', error);
      }
    }

    return {
      ok: alerts.length === 0,
      level: hasStopAlert ? 'STOPPED' : alerts.length > 0 ? 'CRITICAL' : 'OK',
      alerts,
    };
  }
}