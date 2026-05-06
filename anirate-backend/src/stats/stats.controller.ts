import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get()
  getGlobal() {
    return this.service.getGlobal();
  }

  @Get('top-contenido')
  getTopContenido(
    @Query('tipo') tipo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getTopContenido(tipo, limit ? +limit : 20);
  }

  @Get('top-reviews')
  getTopReviews(@Query('limit') limit?: string) {
    return this.service.getTopReviews(limit ? +limit : 10);
  }

  @Get('generos')
  getGeneroStats() {
    return this.service.getGeneroStats();
  }
}
