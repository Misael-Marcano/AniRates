import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { Favorito } from '../database/entities';
import { ContenidoModule } from '../contenido/contenido.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favorito]), ContenidoModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
