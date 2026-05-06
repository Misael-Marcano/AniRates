import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario, Seguimiento, Review } from '../database/entities';
import { MailModule } from '../mail/mail.module';
import { RecomendacionesModule } from '../recomendaciones/recomendaciones.module';
import { DigestService } from './digest.service';
import { DigestScheduler } from './digest.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Seguimiento, Review]),
    MailModule,
    RecomendacionesModule,
  ],
  providers: [DigestService, DigestScheduler],
})
export class DigestModule {}
