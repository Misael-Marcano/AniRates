import {
  Controller,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Param,
  Get,
  Delete,
  Req,
  Res,
  BadRequestException,
  Query,
  Headers,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthService, SessionMeta } from './auth.service';
import { ResendWebhookService } from '../mail/resend-webhook.service';
import {
  RegisterDto,
  LoginDto,
  UpdateMeDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  TwoFactorEnableDto,
  TwoFactorDisableDto,
  TwoFactorLoginVerifyDto,
  EmailUnsubscribeDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import type { OAuthProfile } from './strategies/google.strategy';

function extractMeta(req: ExpressRequest): SessionMeta {
  const fwd = req.headers['x-forwarded-for'];
  const ipFwd = Array.isArray(fwd)
    ? fwd[0]
    : typeof fwd === 'string'
      ? fwd.split(',')[0].trim()
      : undefined;
  const ip = ipFwd ?? req.ip;
  const userAgent = req.headers['user-agent'];
  return {
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
    ip,
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly resendWebhook: ResendWebhookService,
  ) {}

  @Post('register')
  @Throttle({ long: { ttl: 3600000, limit: 5 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ long: { ttl: 60000, limit: 10 } })
  login(@Body() dto: LoginDto, @Req() req: ExpressRequest) {
    return this.authService.login(dto, extractMeta(req));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60000, limit: 30 } })
  refresh(
    @Body() body: { refresh_token?: string },
    @Req() req: ExpressRequest,
  ) {
    return this.authService.refresh(
      body?.refresh_token ?? '',
      extractMeta(req),
    );
  }

  // ─── OAuth ──────────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: ExpressRequest & { user: OAuthProfile },
    @Res() res: ExpressResponse,
  ) {
    const tokens = await this.authService.loginOAuth(
      req.user,
      extractMeta(req),
    );
    return this.redirectWithTokens(res, tokens);
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordAuth(): void {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(
    @Req() req: ExpressRequest & { user: OAuthProfile },
    @Res() res: ExpressResponse,
  ) {
    const tokens = await this.authService.loginOAuth(
      req.user,
      extractMeta(req),
    );
    return this.redirectWithTokens(res, tokens);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth(): void {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() req: ExpressRequest & { user: OAuthProfile },
    @Res() res: ExpressResponse,
  ) {
    const tokens = await this.authService.loginOAuth(
      req.user,
      extractMeta(req),
    );
    return this.redirectWithTokens(res, tokens);
  }

  @Get('oauth/accounts')
  @UseGuards(AuthGuard('jwt'))
  listOAuthAccounts(@Request() req: { user: JwtPayload }) {
    return this.authService.listOAuthAccounts(req.user.sub);
  }

  @Delete('oauth/:provider')
  @UseGuards(AuthGuard('jwt'))
  unlinkOAuth(
    @Param('provider') provider: string,
    @Request() req: { user: JwtPayload },
  ) {
    return this.authService.unlinkOAuth(req.user.sub, provider);
  }

  private redirectWithTokens(
    res: ExpressResponse,
    tokens: { access_token: string; refresh_token: string },
  ) {
    const frontend = process.env.FRONTEND_URL ?? 'http://localhost:5000';
    const url = `${frontend}/auth/callback#access_token=${encodeURIComponent(tokens.access_token)}&refresh_token=${encodeURIComponent(tokens.refresh_token)}`;
    return res.redirect(url);
  }

  @Post('email-unsubscribe')
  @HttpCode(HttpStatus.OK)
  @Throttle({ long: { ttl: 60000, limit: 20 } })
  emailUnsubscribe(@Body() dto: EmailUnsubscribeDto) {
    return this.authService.applyEmailUnsubscribe(dto.token);
  }

  /** RFC 8058: POST `application/x-www-form-urlencoded` con `List-Unsubscribe=One-Click` al URI del header. */
  @Post('email-unsubscribe/one-click')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ long: { ttl: 60000, limit: 40 } })
  async emailUnsubscribeOneClick(@Query('token') token?: string): Promise<void> {
    const t = token?.trim();
    if (!t) throw new BadRequestException('Token requerido');
    await this.authService.applyEmailUnsubscribe(t);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ long: { ttl: 3600000, limit: 5 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ long: { ttl: 3600000, limit: 10 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  /**
   * Webhook proveedor de correo (Resend): Bearer `RESEND_WEBHOOK_SECRET`.
   * Procesa `email.bounced` (permanentes) / `email.complained` → marca usuario y métricas;
   * `email.delivered` solo cuenta en memoria.
   */
  @Post('mail-webhooks/resend')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60000, limit: 120 } })
  async resendMailWebhook(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
  ): Promise<{ ok: true }> {
    const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
    if (!secret) {
      throw new ServiceUnavailableException('Webhook no configurado');
    }
    const bearer =
      typeof authorization === 'string' && authorization.startsWith('Bearer ')
        ? authorization.slice(7).trim()
        : authorization?.trim();
    if (bearer !== secret) {
      throw new UnauthorizedException();
    }
    await this.resendWebhook.handleWebhookPayload(body);
    return { ok: true };
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  updateMe(
    @Body() dto: UpdateMeDto,
    @Req() req: ExpressRequest & { user: JwtPayload },
  ) {
    return this.authService.updateMe(
      req.user.sub,
      req.user.jti ?? '',
      dto,
      extractMeta(req),
    );
  }

  @Get('verify-email/:token')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ long: { ttl: 3600000, limit: 3 } })
  resendVerification(@Request() req: { user: JwtPayload }) {
    return this.authService.resendVerification(req.user.sub);
  }

  // ─── Sesiones ───────────────────────────────────────────────────────────

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  async listSessions(@Request() req: { user: JwtPayload }) {
    const sessions = await this.authService.listSessions(req.user.sub);
    const currentJti = req.user.jti;
    return sessions.map((s) => ({
      id: s.id,
      user_agent: s.user_agent,
      ip: s.ip,
      created_at: s.created_at,
      last_used_at: s.last_used_at,
      current: s.jti === currentJti,
    }));
  }

  @Delete('sessions/:id')
  @UseGuards(AuthGuard('jwt'))
  revokeSession(@Param('id') id: string, @Request() req: { user: JwtPayload }) {
    return this.authService.revokeSession(
      req.user.sub,
      Number(id),
      req.user.jti ?? '',
    );
  }

  @Delete('sessions')
  @UseGuards(AuthGuard('jwt'))
  revokeAllOthers(@Request() req: { user: JwtPayload }) {
    return this.authService.revokeAllExceptCurrent(
      req.user.sub,
      req.user.jti ?? '',
    );
  }

  // ─── 2FA ──────────────────────────────────────────────────────────────

  @Post('2fa/login-verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ long: { ttl: 60000, limit: 10 } })
  loginVerify2FA(
    @Body() dto: TwoFactorLoginVerifyDto,
    @Req() req: ExpressRequest,
  ) {
    return this.authService.loginVerify2FA(
      dto.pending_token,
      dto.code,
      extractMeta(req),
    );
  }

  @Get('2fa/status')
  @UseGuards(AuthGuard('jwt'))
  twoFactorStatus(@Request() req: { user: JwtPayload }) {
    return this.authService.twoFactorStatus(req.user.sub);
  }

  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ long: { ttl: 3600000, limit: 10 } })
  twoFactorSetup(@Request() req: { user: JwtPayload }) {
    return this.authService.twoFactorSetup(req.user.sub);
  }

  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ long: { ttl: 60000, limit: 10 } })
  twoFactorEnable(
    @Body() dto: TwoFactorEnableDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.authService.twoFactorEnable(req.user.sub, dto.code);
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ long: { ttl: 3600000, limit: 10 } })
  twoFactorDisable(
    @Body() dto: TwoFactorDisableDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.authService.twoFactorDisable(req.user.sub, dto);
  }

  @Post('2fa/backup-codes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ long: { ttl: 3600000, limit: 5 } })
  twoFactorRegenerateBackupCodes(
    @Body() dto: TwoFactorEnableDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.authService.twoFactorRegenerateBackupCodes(
      req.user.sub,
      dto.code,
    );
  }
}
