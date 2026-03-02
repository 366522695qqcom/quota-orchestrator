import { Module } from '@nestjs/common';
import { ProviderConfigController } from './provider-config.controller';
import { ProviderConfigService } from './provider-config.service';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [EncryptionModule],
  controllers: [ProviderConfigController],
  providers: [ProviderConfigService],
  exports: [ProviderConfigService],
})
export class ProviderConfigModule {}