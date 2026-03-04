import { Module } from '@nestjs/common';
import { QuotaEngineService } from './quota-engine.service';

@Module({
  providers: [QuotaEngineService],
  exports: [QuotaEngineService],
})
export class QuotaEngineModule {}