import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/rating.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  rate(@Body() dto: CreateRatingDto, @Request() req: { user: JwtPayload }) {
    return this.ratingsService.rate(dto, req.user.sub);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  findMine(@Request() req: { user: JwtPayload }) {
    return this.ratingsService.findByUser(req.user.sub);
  }

  @Get('contenido/:id')
  findByContenido(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.findByContenido(id);
  }

  @Get('distribution/:id')
  getDistribution(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.getDistribution(id);
  }

  @Get('distribution/jikan/:jikanId')
  getDistributionByJikanId(@Param('jikanId', ParseIntPipe) jikanId: number) {
    return this.ratingsService.getDistributionByJikanId(jikanId);
  }
}
