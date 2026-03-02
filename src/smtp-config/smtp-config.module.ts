import { Module } from '@nestjs/common';
import { SmtpConfigService } from './smtp-config.service';

@Module({
  providers: [SmtpConfigService],
  exports: [SmtpConfigService],
})
export class SmtpConfigModule {}