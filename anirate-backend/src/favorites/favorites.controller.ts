import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/favorite.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  add(@Body() dto: CreateFavoriteDto, @Request() req: { user: JwtPayload }) {
    return this.favoritesService.add(dto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.favoritesService.remove(id, req.user.sub);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.favoritesService.findByUser(userId);
  }
}
