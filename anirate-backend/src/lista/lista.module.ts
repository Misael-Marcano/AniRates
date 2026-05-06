import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListaController } from './lista.controller';
import { ListaService } from './lista.service';
import { ListaItem } from '../database/entities';
import { ContenidoModule } from '../contenido/contenido.module';

@Module({
  imports: [TypeOrmModule.forFeature([ListaItem]), ContenidoModule],
  controllers: [ListaController],
  providers: [ListaService],
  exports: [ListaService],
})
export class ListaModule {}
