import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { PersonajesService } from './personajes.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller()
export class PersonajesController {
  constructor(private readonly service: PersonajesService) {}

  @Get('contenido/:jikanId/personajes')
  @Throttle({ short: { ttl: 1000, limit: 5 } })
  byContenido(@Param('jikanId', ParseIntPipe) jikanId: number) {
    return this.service.getByContenido(jikanId);
  }

  @Get('personaje/:malId')
  one(@Param('malId', ParseIntPipe) malId: number) {
    return this.service.getPersonaje(malId);
  }

  @Get('voice-actor/:malId')
  va(@Param('malId', ParseIntPipe) malId: number) {
    return this.service.getVoiceActor(malId);
  }

  @Get('me/favoritos-personajes')
  @UseGuards(AuthGuard('jwt'))
  myFavorites(@Request() req: { user: JwtPayload }) {
    return this.service.myFavoritePersonajes(req.user.sub);
  }

  @Get('personaje/:malId/is-favorito')
  @UseGuards(AuthGuard('jwt'))
  isFavorite(
    @Param('malId', ParseIntPipe) malId: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.isFavorite(req.user.sub, malId);
  }

  @Post('personaje/:malId/favorito')
  @UseGuards(AuthGuard('jwt'))
  favorite(
    @Param('malId', ParseIntPipe) malId: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.favorite(req.user.sub, malId);
  }

  @Delete('personaje/:malId/favorito')
  @UseGuards(AuthGuard('jwt'))
  unfavorite(
    @Param('malId', ParseIntPipe) malId: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.unfavorite(req.user.sub, malId);
  }
}
