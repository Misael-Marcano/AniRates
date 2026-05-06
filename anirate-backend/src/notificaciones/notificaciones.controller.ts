import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { NotificacionesService } from './notificaciones.service';
import { AiringSyncService } from './airing-sync.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('notificaciones')
@UseGuards(AuthGuard('jwt'))
export class NotificacionesController {
  constructor(
    private readonly service: NotificacionesService,
    private readonly airingSync: AiringSyncService,
  ) {}

  @Get()
  findAll(
    @Request() req: { user: JwtPayload },
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByUser(req.user.sub, { cursor, limit });
  }

  @Get('unread-count')
  unreadCount(@Request() req: { user: JwtPayload }) {
    return this.service.countUnread(req.user.sub);
  }

  @Patch('leer-todas')
  markAllRead(@Request() req: { user: JwtPayload }) {
    return this.service.markAllRead(req.user.sub);
  }

  @Patch(':id/leer')
  markRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.markRead(id, req.user.sub);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @Throttle({ long: { ttl: 1800000, limit: 2 } })
  sync(@Request() req: { user: JwtPayload }) {
    return this.airingSync.syncForUser(req.user.sub);
  }
}
