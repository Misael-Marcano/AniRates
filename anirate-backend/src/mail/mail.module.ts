import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../database/entities';
import { MailService } from './mail.service';
import { MailMetricsService } from './mail-metrics.service';
import { ResendWebhookService } from './resend-webhook.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [MailService, MailMetricsService, ResendWebhookService],
  exports: [MailService, MailMetricsService, ResendWebhookService],
})
export class MailModule {}
