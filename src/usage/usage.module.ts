import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UsageService } from './usage.service';
import { VercelUsageProvider } from './providers/vercel-usage.provider';
import { CloudflareUsageProvider } from './providers/cloudflare-usage.provider';
import { NetlifyUsageProvider } from './providers/netlify-usage.provider';
import { RenderUsageProvider } from './providers/render-usage.provider';
import { UsageController } from './usage.controller';
import { DatabaseModule } from '../database/database.module';
import { ProviderConfigModule } from '../provider-config/provider-config.module';
import { QuotaEngineModule } from '../quota-engine/quota-engine.module';
import { ServiceControlModule } from '../service-control/service-control.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    ProviderConfigModule,
    QuotaEngineModule,
    ServiceControlModule,
    LoggerModule,
  ],
  providers: [
    UsageService,
    VercelUsageProvider,
    CloudflareUsageProvider,
    NetlifyUsageProvider,
    RenderUsageProvider,
  ],
  controllers: [UsageController],
  exports: [UsageService],
})
export class UsageModule {}
