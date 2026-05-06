import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ListaPersonalizada,
  ListaPersonalizadaContenido,
} from '../database/entities';
import { ListasPersonalizadasService } from './listas-personalizadas.service';
import { ListasPersonalizadasController } from './listas-personalizadas.controller';
import { ContenidoModule } from '../contenido/contenido.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListaPersonalizada, ListaPersonalizadaContenido]),
    ContenidoModule,
  ],
  providers: [ListasPersonalizadasService],
  controllers: [ListasPersonalizadasController],
})
export class ListasPersonalizadasModule {}
