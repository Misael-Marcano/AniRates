import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ImportService } from './import.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('import')
@UseGuards(AuthGuard('jwt'))
export class ImportController {
  constructor(private readonly service: ImportService) {}

  @Post('mal')
  @Throttle({ long: { ttl: 3600000, limit: 3 } })
  importMal(
    @Body() body: { xml: string },
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.importMalXml(req.user.sub, body?.xml ?? '');
  }

  @Post('anilist')
  @Throttle({ long: { ttl: 3600000, limit: 5 } })
  importAnilist(
    @Body() body: { username: string },
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.importAnilist(req.user.sub, body?.username ?? '');
  }
}
