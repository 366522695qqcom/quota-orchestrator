import { Module } from '@nestjs/common';
import { QuotaEngineService } from './quota-engine.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [QuotaEngineService],
  exports: [QuotaEngineService],
})
export class QuotaEngineModule {}