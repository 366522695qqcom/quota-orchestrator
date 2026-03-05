import { Module } from '@nestjs/common';
import { QuotaEngineService } from './quota-engine.service';
import { MailModule } from '../mail/mail.module';
import { ProviderConfigModule } from '../provider-config/provider-config.module';

@Module({
  imports: [MailModule, ProviderConfigModule],
  providers: [QuotaEngineService],
  exports: [QuotaEngineService],
})
export class QuotaEngineModule {}