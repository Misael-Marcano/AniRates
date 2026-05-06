import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { StreamingService } from './streaming.service';

@Controller('watch')
export class StreamingController {
  constructor(private readonly service: StreamingService) {}

  @Get('providers')
  list() {
    return this.service.listProviders();
  }

  @Get('by-provider/:provider')
  byProvider(@Param('provider') provider: string) {
    return this.service.byProvider(provider);
  }

  @Get(':jikanId')
  get(
    @Param('jikanId', ParseIntPipe) jikanId: number,
    @Query('title') title?: string,
    @Query('tipo') tipo?: 'anime' | 'manga',
  ) {
    return this.service.getProviders(
      jikanId,
      title ?? '',
      tipo === 'manga' ? 'manga' : 'anime',
    );
  }
}
