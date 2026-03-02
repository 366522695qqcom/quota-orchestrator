import { Module } from '@nestjs/common';
import { ServiceControlController } from './service-control.controller';
import { ServiceControlService } from './service-control.service';
import { ProviderConfigModule } from '../provider-config/provider-config.module';

@Module({
  imports: [ProviderConfigModule],
  controllers: [ServiceControlController],
  providers: [ServiceControlService],
  exports: [ServiceControlService],
})
export class ServiceControlModule {}