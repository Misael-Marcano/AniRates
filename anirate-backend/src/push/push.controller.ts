import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { PushService } from './push.service';
import { PushSubscribeDto, PushUnsubscribeDto } from './dto/push-subscribe.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Get('vapid-public-key')
  vapidPublicKey() {
    const publicKey = this.push.getVapidPublicKey();
    return { publicKey, configured: this.push.isReady() };
  }

  @Post('subscribe')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ short: { ttl: 1000, limit: 5 } })
  async subscribe(
    @Request() req: { user: JwtPayload },
    @Body() dto: PushSubscribeDto,
  ): Promise<void> {
    if (!this.push.isReady()) {
      throw new ServiceUnavailableException(
        'Web Push no está configurado en el servidor',
      );
    }
    await this.push.subscribe(req.user.sub, {
      endpoint: dto.endpoint,
      p256dh: dto.p256dh,
      auth: dto.auth,
    });
  }

  @Post('unsubscribe')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsubscribe(
    @Request() req: { user: JwtPayload },
    @Body() dto: PushUnsubscribeDto,
  ): Promise<void> {
    await this.push.unsubscribe(req.user.sub, dto.endpoint);
  }
}
