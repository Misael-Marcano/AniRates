import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecomendacionesService } from './recomendaciones.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('recomendaciones')
export class RecomendacionesController {
  constructor(private readonly service: RecomendacionesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getMine(
    @Request() req: { user: JwtPayload },
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    return this.service.getForUser(req.user.sub, safeLimit);
  }
}
