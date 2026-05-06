import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsUploadService } from './reviews-upload.service';
import {
  Review,
  ReviewVersion,
  ReviewReport,
  ReviewVoto,
  ReviewRespuesta,
} from '../database/entities';
import { ContenidoModule } from '../contenido/contenido.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { ModeracionModule } from '../moderacion/moderacion.module';

@Module({
  imports: [
    ModeracionModule,
    TypeOrmModule.forFeature([
      Review,
      ReviewVersion,
      ReviewReport,
      ReviewVoto,
      ReviewRespuesta,
    ]),
    ContenidoModule,
    NotificacionesModule,
    UsersModule,
    MailModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsUploadService],
})
export class ReviewsModule {}
