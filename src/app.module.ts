import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { UsageModule } from './usage/usage.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { DatabaseModule } from './database/database.module';
import { EncryptionModule } from './encryption/encryption.module';
import { ProviderConfigModule } from './provider-config/provider-config.module';
import { QuotaEngineModule } from './quota-engine/quota-engine.module';
import { ServiceControlModule } from './service-control/service-control.module';
import { MailModule } from './mail/mail.module';
import { LoggerModule } from './logger/logger.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { BackupModule } from './backup/backup.module';
import { SmtpConfigModule } from './smtp-config/smtp-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    EncryptionModule,
    AuthModule,
    ProviderConfigModule,
    QuotaEngineModule,
    ServiceControlModule,
    MailModule,
    LoggerModule,
    BackupModule,
    SmtpConfigModule,
    UsageModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

