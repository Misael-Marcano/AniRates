import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContenidoController } from './contenido.controller';
import { ContenidoService } from './contenido.service';
import { Contenido, ContenidoReport, Rating } from '../database/entities';
import { ModeracionModule } from '../moderacion/moderacion.module';

@Module({
  imports: [
    ModeracionModule,
    TypeOrmModule.forFeature([Contenido, ContenidoReport, Rating]),
  ],
  controllers: [ContenidoController],
  providers: [ContenidoService],
  exports: [ContenidoService],
})
export class ContenidoModule {}
