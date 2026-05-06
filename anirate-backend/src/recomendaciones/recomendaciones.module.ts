import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecomendacionesController } from './recomendaciones.controller';
import { RecomendacionesService } from './recomendaciones.service';
import { Rating, Favorito, ListaItem, Contenido } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Favorito, ListaItem, Contenido])],
  controllers: [RecomendacionesController],
  providers: [RecomendacionesService],
  exports: [RecomendacionesService],
})
export class RecomendacionesModule {}
