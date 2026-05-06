import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { Rating } from '../database/entities';
import { ContenidoModule } from '../contenido/contenido.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rating]), ContenidoModule],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
