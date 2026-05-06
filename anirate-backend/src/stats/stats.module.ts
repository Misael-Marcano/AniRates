import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contenido, Rating, Review, Usuario } from '../database/entities';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contenido, Rating, Review, Usuario])],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
