import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SynopsisService, type Lang } from './synopsis.service';
import { CoverArtService } from './cover-art.service';

const VALID_LANGS = new Set<Lang>(['en', 'es', 'pt-BR', 'ja']);

@Controller()
export class SynopsisController {
  constructor(
    private readonly service: SynopsisService,
    private readonly coverArt: CoverArtService,
  ) {}

  @Get('contenido/:jikanId/synopsis')
  @Throttle({ short: { ttl: 1000, limit: 5 } })
  get(
    @Param('jikanId', ParseIntPipe) jikanId: number,
    @Query('lang') lang: string = 'en',
    @Query('tipo') tipo: 'anime' | 'manga' = 'anime',
  ) {
    const safeLang: Lang = VALID_LANGS.has(lang as Lang)
      ? (lang as Lang)
      : 'en';
    const safeTipo: 'anime' | 'manga' = tipo === 'manga' ? 'manga' : 'anime';
    return this.service.getSynopsis(jikanId, safeLang, safeTipo);
  }

  /** Portada / banner desde AniList (idMal = Jikan/MAL id). Mejor calidad que muchas URLs de Jikan para hero. */
  @Get('contenido/:jikanId/cover-art')
  @Throttle({ short: { ttl: 1000, limit: 12 } })
  getCoverArt(
    @Param('jikanId', ParseIntPipe) jikanId: number,
    @Query('tipo') tipo: 'anime' | 'manga' = 'anime',
  ) {
    const safeTipo: 'anime' | 'manga' = tipo === 'manga' ? 'manga' : 'anime';
    return this.coverArt.getCoverArt(jikanId, safeTipo);
  }
}
