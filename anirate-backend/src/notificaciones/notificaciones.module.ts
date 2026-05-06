import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListaItem, Notificacion, Usuario } from '../database/entities';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { AiringSyncService } from './airing-sync.service';
import { PushModule } from '../push/push.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion, ListaItem, Usuario]),
    PushModule,
  ],
  providers: [NotificacionesService, AiringSyncService],
  controllers: [NotificacionesController],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
