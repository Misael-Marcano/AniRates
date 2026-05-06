import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Personaje,
  VoiceActor,
  ContenidoPersonaje,
  PersonajeVoiceActor,
  FavoritoPersonaje,
} from '../database/entities';
import { PersonajesController } from './personajes.controller';
import { PersonajesService } from './personajes.service';
import { ContenidoModule } from '../contenido/contenido.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Personaje,
      VoiceActor,
      ContenidoPersonaje,
      PersonajeVoiceActor,
      FavoritoPersonaje,
    ]),
    ContenidoModule,
  ],
  controllers: [PersonajesController],
  providers: [PersonajesService],
  exports: [PersonajesService],
})
export class PersonajesModule {}
