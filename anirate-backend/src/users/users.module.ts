import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Usuario,
  Seguimiento,
  Favorito,
  Review,
  Rating,
  ListaItem,
  UserReport,
} from '../database/entities';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ModeracionModule } from '../moderacion/moderacion.module';

@Module({
  imports: [
    ModeracionModule,
    TypeOrmModule.forFeature([
      Usuario,
      Seguimiento,
      Favorito,
      Review,
      Rating,
      ListaItem,
      UserReport,
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
