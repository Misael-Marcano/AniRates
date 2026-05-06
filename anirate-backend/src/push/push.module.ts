import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Contenido,
  PushSubscription,
  Review,
  ReviewRespuesta,
  Usuario,
} from '../database/entities';
import { PushService } from './push.service';
import { PushController } from './push.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PushSubscription,
      Usuario,
      Contenido,
      Review,
      ReviewRespuesta,
    ]),
  ],
  providers: [PushService],
  controllers: [PushController],
  exports: [PushService],
})
export class PushModule {}
