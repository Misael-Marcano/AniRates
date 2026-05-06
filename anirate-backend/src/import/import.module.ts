import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListaItem, Rating } from '../database/entities';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { ContenidoModule } from '../contenido/contenido.module';

@Module({
  imports: [TypeOrmModule.forFeature([ListaItem, Rating]), ContenidoModule],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
