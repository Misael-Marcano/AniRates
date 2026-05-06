import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import {
  Usuario,
  PasswordResetToken,
  EmailVerificationToken,
  Sesion,
  TwoFactorSecret,
  OAuthAccount,
} from '../database/entities';
import {
  RegisterDto,
  LoginDto,
  UpdateMeDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  TwoFactorDisableDto,
} from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
import { PushService } from '../push/push.service';
import { sanitizePlainText } from '../common/sanitize';
import { verifyEmailUnsubscribeToken } from '../common/email-unsubscribe-token';
import { isValidIanaTimezone } from '../common/iana-timezone';
import { parseFullTipoChannelsPatch } from '../common/notification-prefs';

export interface SessionMeta {
  userAgent?: string;
  ip?: string;
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
const TWOFA_PENDING_TTL = '5m';
const TWOFA_ISSUER = 'AniRates';
const BACKUP_CODE_COUNT = 10;

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface LoginResult {
  access_token?: string;
  refresh_token?: string;
  requires2FA?: boolean;
  pending_token?: string;
}

@Injectable()
export class AuthService {
  private assertNotBanned(user: Usuario): void {
    if (user.banned)
      throw new UnauthorizedException('Cuenta suspendida');
  }

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(PasswordResetToken)
    private readonly resetRepo: Repository<PasswordResetToken>,
    @InjectRepository(EmailVerificationToken)
    private readonly verifyRepo: Repository<EmailVerificationToken>,
    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,
    @InjectRepository(TwoFactorSecret)
    private readonly twoFaRepo: Repository<TwoFactorSecret>,
    @InjectRepository(OAuthAccount)
    private readonly oauthRepo: Repository<OAuthAccount>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly pushService: PushService,
  ) {}

  async loginOAuth(
    profile: {
      provider: string;
      providerId: string;
      email: string;
      displayName: string;
      avatar?: string;
    },
    meta: SessionMeta,
  ): Promise<TokenPair> {
    let oauth = await this.oauthRepo.findOne({
      where: {
        provider: profile.provider,
        provider_user_id: profile.providerId,
      },
    });
    let user: Usuario | null = null;

    if (oauth) {
      user = await this.usuarioRepo.findOne({
        where: { id: oauth.usuario_id },
      });
    } else if (profile.email) {
      user = await this.usuarioRepo.findOne({
        where: { email: profile.email },
      });
      if (!user) {
        const randomPass = await bcrypt.hash(
          crypto.randomBytes(24).toString('hex'),
          10,
        );
        user = await this.usuarioRepo.save(
          this.usuarioRepo.create({
            nombre: profile.displayName.slice(0, 100),
            email: profile.email,
            password: randomPass,
            email_verificado: true,
            avatar_url: profile.avatar,
          }),
        );
      }
      oauth = await this.oauthRepo.save(
        this.oauthRepo.create({
          provider: profile.provider,
          provider_user_id: profile.providerId,
          usuario_id: user.id,
          email: profile.email,
        }),
      );
    } else {
      throw new UnauthorizedException('Email no proporcionado por el provider');
    }

    if (!user) throw new UnauthorizedException();
    this.assertNotBanned(user);
    return this.issueToken(user, meta, { notifyNewLogin: true });
  }

  async listOAuthAccounts(
    userId: number,
  ): Promise<{ provider: string; email: string; created_at: Date }[]> {
    const accounts = await this.oauthRepo.find({
      where: { usuario_id: userId },
    });
    return accounts.map((a) => ({
      provider: a.provider,
      email: a.email,
      created_at: a.created_at,
    }));
  }

  async unlinkOAuth(
    userId: number,
    provider: string,
  ): Promise<{ message: string }> {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const accounts = await this.oauthRepo.find({
      where: { usuario_id: userId },
    });
    if (accounts.length === 1 && !user.password) {
      throw new BadRequestException(
        'No puedes desvincular tu única forma de inicio de sesión',
      );
    }
    const target = accounts.find((a) => a.provider === provider);
    if (!target) throw new NotFoundException();
    await this.oauthRepo.delete({ id: target.id });
    return { message: 'Cuenta desvinculada' };
  }

  private async maybeSendNewLoginEmail(
    user: Usuario,
    meta: SessionMeta,
    newJti: string,
  ): Promise<void> {
    const ip = meta.ip?.slice(0, 64) ?? '';
    const ua = meta.userAgent?.slice(0, 500) ?? '';
    const active = await this.sesionRepo.find({
      where: { usuario_id: user.id, revoked_at: IsNull() },
    });
    const prior = active.filter((s) => s.jti !== newJti);
    const duplicateEnv = prior.some(
      (s) => (s.ip ?? '') === ip && (s.user_agent ?? '') === ua,
    );
    if (duplicateEnv) return;
    await this.mailService.sendNewLoginAlert(user.email, {
      nombre: user.nombre,
      ip: ip || 'desconocida',
      userAgent: ua || 'desconocido',
    });
  }

  private async issueToken(
    user: Usuario,
    meta: SessionMeta,
    opts?: { notifyNewLogin?: boolean },
  ): Promise<TokenPair> {
    this.assertNotBanned(user);
    const jti = crypto.randomBytes(24).toString('hex');
    const refreshPlain = crypto.randomBytes(48).toString('hex');
    const refreshHash = await bcrypt.hash(refreshPlain, 10);

    const sesion = new Sesion();
    sesion.usuario_id = user.id;
    sesion.jti = jti;
    sesion.user_agent = meta.userAgent?.slice(0, 500) ?? '';
    sesion.ip = meta.ip?.slice(0, 64) ?? '';
    sesion.last_used_at = new Date();
    sesion.refresh_hash = refreshHash;
    sesion.refresh_expires_at = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await this.sesionRepo.save(sesion);

    if (opts?.notifyNewLogin && user.email_verificado) {
      void this.maybeSendNewLoginEmail(user, meta, jti).catch(() => {});
    }

    const payload = {
      sub: user.id,
      nombre: user.nombre,
      email: user.email,
      tipo: user.tipo,
      jti,
    };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: `${jti}.${refreshPlain}`,
    };
  }

  async refresh(token: string, meta: SessionMeta): Promise<TokenPair> {
    if (!token || !token.includes('.'))
      throw new UnauthorizedException('Refresh token inválido');
    const [jti, secret] = token.split('.', 2);
    if (!jti || !secret)
      throw new UnauthorizedException('Refresh token inválido');

    const sesion = await this.sesionRepo.findOne({ where: { jti } });
    if (!sesion || sesion.revoked_at)
      throw new UnauthorizedException('Sesión revocada');
    if (!sesion.refresh_hash || !sesion.refresh_expires_at)
      throw new UnauthorizedException();
    if (sesion.refresh_expires_at.getTime() < Date.now()) {
      sesion.revoked_at = new Date();
      await this.sesionRepo.save(sesion);
      throw new UnauthorizedException('Refresh token expirado');
    }

    const valid = await bcrypt.compare(secret, sesion.refresh_hash);
    if (!valid) {
      // Posible token reuse → revocar sesión por seguridad
      sesion.revoked_at = new Date();
      await this.sesionRepo.save(sesion);
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.usuarioRepo.findOne({
      where: { id: sesion.usuario_id },
    });
    if (!user) throw new UnauthorizedException();
    this.assertNotBanned(user);

    // Rotación: revoca sesión actual y emite nueva
    sesion.revoked_at = new Date();
    await this.sesionRepo.save(sesion);

    return this.issueToken(user, meta);
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ id: number; verifyToken?: string }> {
    const exists = await this.usuarioRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('El email ya está registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usuarioRepo.create({ ...dto, password: hashed });
    const saved = await this.usuarioRepo.save(user);

    // Genera token de verificación de email
    const token = crypto.randomBytes(32).toString('hex');
    await this.verifyRepo.save(
      this.verifyRepo.create({
        usuario_id: saved.id,
        token,
        expires_at: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
      }),
    );

    const sendResult = await this.mailService.sendVerifyEmail(
      saved.email,
      token,
      saved.nombre,
    );
    void this.mailService.sendWelcome(saved.email, saved.nombre);

    if (sendResult.delivered) return { id: saved.id };
    return { id: saved.id, verifyToken: token };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const record = await this.verifyRepo.findOne({
      where: { token },
      relations: ['usuario'],
    });
    if (!record) throw new NotFoundException('Token inválido');
    if (record.used) throw new BadRequestException('Este enlace ya fue usado');
    if (record.expires_at.getTime() < Date.now())
      throw new BadRequestException('El enlace ha expirado');

    record.usuario.email_verificado = true;
    await this.usuarioRepo.save(record.usuario);
    record.used = true;
    await this.verifyRepo.save(record);

    return { message: 'Email verificado correctamente' };
  }

  async resendVerification(
    userId: number,
  ): Promise<{ message: string; devToken?: string }> {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.email_verificado)
      throw new BadRequestException('El email ya está verificado');

    // Invalida tokens previos no usados
    await this.verifyRepo.update(
      { usuario_id: userId, used: false },
      { used: true },
    );

    const token = crypto.randomBytes(32).toString('hex');
    await this.verifyRepo.save(
      this.verifyRepo.create({
        usuario_id: userId,
        token,
        expires_at: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
      }),
    );

    const sendResult = await this.mailService.sendVerifyEmail(
      user.email,
      token,
      user.nombre,
    );
    const msg = 'Se ha generado un nuevo enlace de verificación';
    if (sendResult.delivered) return { message: msg };
    return { message: msg, devToken: token };
  }

  async login(dto: LoginDto, meta: SessionMeta): Promise<LoginResult> {
    const user = await this.usuarioRepo.findOne({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');
    this.assertNotBanned(user);

    if (user.two_factor_enabled) {
      const pending_token = this.jwtService.sign(
        { sub: user.id, purpose: '2fa' },
        { expiresIn: TWOFA_PENDING_TTL },
      );
      return { requires2FA: true, pending_token };
    }

    return this.issueToken(user, meta, { notifyNewLogin: true });
  }

  async loginVerify2FA(
    pendingToken: string,
    code: string,
    meta: SessionMeta,
  ): Promise<{ access_token: string }> {
    let payload: { sub: number; purpose: string };
    try {
      payload = this.jwtService.verify(pendingToken);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    if (payload.purpose !== '2fa')
      throw new UnauthorizedException('Token inválido');

    const user = await this.usuarioRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.two_factor_enabled) throw new UnauthorizedException();
    this.assertNotBanned(user);

    await this.consumeTwoFactorCode(user.id, code);
    return this.issueToken(user, meta, { notifyNewLogin: true });
  }

  // ─── 2FA ────────────────────────────────────────────────────────────────

  async twoFactorStatus(
    userId: number,
  ): Promise<{ enabled: boolean; pending_setup: boolean }> {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    const secret = await this.twoFaRepo.findOne({
      where: { usuario_id: userId },
    });
    return {
      enabled: user.two_factor_enabled,
      pending_setup: Boolean(secret && !secret.enabled),
    };
  }

  async twoFactorSetup(
    userId: number,
  ): Promise<{ secret: string; otpauth_url: string; qr_data_url: string }> {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    if (user.two_factor_enabled)
      throw new BadRequestException('2FA ya está activado');

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${TWOFA_ISSUER}:${user.email}`,
      issuer: TWOFA_ISSUER,
    });

    // Upsert: reemplaza secreto pendiente anterior si existe
    await this.twoFaRepo.delete({ usuario_id: userId });
    await this.twoFaRepo.save(
      this.twoFaRepo.create({
        usuario_id: userId,
        secret: secret.base32,
        enabled: false,
        backup_codes: '',
      }),
    );

    const otpauth_url = secret.otpauth_url ?? '';
    const qr_data_url = await qrcode.toDataURL(otpauth_url);
    return { secret: secret.base32, otpauth_url, qr_data_url };
  }

  async twoFactorEnable(
    userId: number,
    code: string,
  ): Promise<{ backup_codes: string[] }> {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    if (user.two_factor_enabled)
      throw new BadRequestException('2FA ya está activado');

    const record = await this.twoFaRepo.findOne({
      where: { usuario_id: userId },
    });
    if (!record)
      throw new BadRequestException('Debes iniciar el setup de 2FA primero');

    const ok = speakeasy.totp.verify({
      secret: record.secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!ok) throw new UnauthorizedException('Código inválido');

    const plainCodes = Array.from({ length: BACKUP_CODE_COUNT }, () =>
      crypto.randomBytes(5).toString('hex').toUpperCase(),
    );
    const hashed = await Promise.all(plainCodes.map((c) => bcrypt.hash(c, 8)));
    record.backup_codes = JSON.stringify(hashed);
    record.enabled = true;
    await this.twoFaRepo.save(record);

    user.two_factor_enabled = true;
    await this.usuarioRepo.save(user);

    return { backup_codes: plainCodes };
  }

  async twoFactorDisable(
    userId: number,
    dto: TwoFactorDisableDto,
  ): Promise<{ message: string }> {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    if (!user.two_factor_enabled)
      throw new BadRequestException('2FA no está activado');

    if (dto.password) {
      const ok = await bcrypt.compare(dto.password, user.password);
      if (!ok) throw new UnauthorizedException('Contraseña incorrecta');
    } else if (dto.code) {
      await this.consumeTwoFactorCode(userId, dto.code);
    } else {
      throw new BadRequestException('Se requiere contraseña o código 2FA');
    }

    await this.twoFaRepo.delete({ usuario_id: userId });
    user.two_factor_enabled = false;
    await this.usuarioRepo.save(user);
    return { message: '2FA desactivado' };
  }

  async twoFactorRegenerateBackupCodes(
    userId: number,
    code: string,
  ): Promise<{ backup_codes: string[] }> {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user || !user.two_factor_enabled)
      throw new BadRequestException('2FA no está activado');

    const record = await this.twoFaRepo.findOne({
      where: { usuario_id: userId },
    });
    if (!record) throw new NotFoundException();

    const ok = speakeasy.totp.verify({
      secret: record.secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!ok) throw new UnauthorizedException('Código inválido');

    const plainCodes = Array.from({ length: BACKUP_CODE_COUNT }, () =>
      crypto.randomBytes(5).toString('hex').toUpperCase(),
    );
    const hashed = await Promise.all(plainCodes.map((c) => bcrypt.hash(c, 8)));
    record.backup_codes = JSON.stringify(hashed);
    await this.twoFaRepo.save(record);
    return { backup_codes: plainCodes };
  }

  private async consumeTwoFactorCode(
    userId: number,
    code: string,
  ): Promise<void> {
    const record = await this.twoFaRepo.findOne({
      where: { usuario_id: userId, enabled: true },
    });
    if (!record) throw new UnauthorizedException('2FA no configurado');

    const normalized = code.trim().replace(/\s+/g, '');
    const ok = speakeasy.totp.verify({
      secret: record.secret,
      encoding: 'base32',
      token: normalized,
      window: 1,
    });
    if (ok) return;

    // Fallback: backup code
    if (record.backup_codes) {
      const hashes: string[] = JSON.parse(record.backup_codes);
      const upper = normalized.toUpperCase();
      for (let i = 0; i < hashes.length; i++) {
        if (await bcrypt.compare(upper, hashes[i])) {
          hashes.splice(i, 1);
          record.backup_codes = JSON.stringify(hashes);
          await this.twoFaRepo.save(record);
          return;
        }
      }
    }
    throw new UnauthorizedException('Código inválido');
  }

  async updateMe(
    userId: number,
    currentJti: string,
    dto: UpdateMeDto,
    meta: SessionMeta,
  ): Promise<{ access_token: string }> {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    this.assertNotBanned(user);

    const passwordChanged = Boolean(dto.newPassword);
    if (passwordChanged) {
      if (!dto.currentPassword)
        throw new BadRequestException('Se requiere la contraseña actual');
      const valid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!valid)
        throw new UnauthorizedException('Contraseña actual incorrecta');
      user.password = await bcrypt.hash(dto.newPassword!, 10);
    }

    if (dto.nombre?.trim()) user.nombre = sanitizePlainText(dto.nombre, 100);
    if (dto.bio !== undefined)
      user.bio = sanitizePlainText(dto.bio, 280) || (null as unknown as string);
    if (dto.avatar_url !== undefined)
      user.avatar_url = dto.avatar_url.trim() || (null as unknown as string);

    if (dto.notification_prefs !== undefined) {
      const cur = { ...(user.notification_prefs ?? {}) };
      const p = dto.notification_prefs;
      if (p.email_mentions !== undefined) cur.email_mentions = p.email_mentions;
      if (p.email_weekly_digest !== undefined)
        cur.email_weekly_digest = p.email_weekly_digest;
      if (p.digest_timezone !== undefined) {
        const raw = p.digest_timezone.trim();
        if (!raw) {
          delete cur.digest_timezone;
        } else {
          if (!isValidIanaTimezone(raw)) {
            throw new BadRequestException('Zona horaria inválida');
          }
          cur.digest_timezone = raw;
        }
      }
      if (p.push_in_app_browser !== undefined) {
        cur.push_in_app_browser = p.push_in_app_browser;
        if (p.push_in_app_browser === false) {
          void this.pushService.removeAllForUser(userId);
        }
      }
      if (p.tipo_channels !== undefined) {
        try {
          const full = parseFullTipoChannelsPatch(p.tipo_channels);
          if (full) {
            cur.tipo_channels = full;
            cur.email_mentions =
              full.mencion_review.email && full.mencion_respuesta.email;
          }
        } catch (e) {
          throw new BadRequestException(
            (e as Error).message || 'tipo_channels inválido',
          );
        }
      }
      user.notification_prefs = Object.keys(cur).length > 0 ? cur : null;
    }

    await this.usuarioRepo.save(user);

    // Cambio de contraseña revoca sesiones antiguas
    if (passwordChanged) {
      await this.sesionRepo
        .createQueryBuilder()
        .update(Sesion)
        .set({ revoked_at: new Date() })
        .where('usuario_id = :uid AND jti != :jti AND revoked_at IS NULL', {
          uid: user.id,
          jti: currentJti,
        })
        .execute();
    }

    return this.issueToken(user, meta);
  }

  /** One-click desde enlace en correos (menciones / digest); firma HMAC con JWT_SECRET. */
  async applyEmailUnsubscribe(token: string): Promise<{ ok: true }> {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16)
      throw new BadRequestException('Configuración inválida');
    const payload = verifyEmailUnsubscribeToken(token, secret);
    if (!payload) throw new BadRequestException('Enlace inválido o caducado');
    const user = await this.usuarioRepo.findOne({ where: { id: payload.uid } });
    if (!user) throw new BadRequestException('Enlace inválido o caducado');
    const cur = {
      email_mentions: true,
      email_weekly_digest: false,
      ...(user.notification_prefs ?? {}),
    };
    if (payload.scope === 'mentions' || payload.scope === 'all') {
      cur.email_mentions = false;
      cur.tipo_channels = {
        ...(cur.tipo_channels ?? {}),
        mencion_review: {
          ...(cur.tipo_channels?.mencion_review ?? {}),
          email: false,
        },
        mencion_respuesta: {
          ...(cur.tipo_channels?.mencion_respuesta ?? {}),
          email: false,
        },
      };
    }
    if (payload.scope === 'digest' || payload.scope === 'all') {
      cur.email_weekly_digest = false;
    }
    user.notification_prefs = cur;
    await this.usuarioRepo.save(user);
    return { ok: true };
  }

  async listSessions(userId: number): Promise<Sesion[]> {
    return this.sesionRepo.find({
      where: { usuario_id: userId, revoked_at: IsNull() },
      order: { last_used_at: 'DESC' },
    });
  }

  async revokeSession(
    userId: number,
    sessionId: number,
    currentJti: string,
  ): Promise<{ message: string }> {
    const sesion = await this.sesionRepo.findOne({ where: { id: sessionId } });
    if (!sesion || sesion.usuario_id !== userId)
      throw new NotFoundException('Sesión no encontrada');
    if (sesion.jti === currentJti)
      throw new ForbiddenException(
        'No puedes revocar la sesión actual desde aquí',
      );
    if (sesion.revoked_at) return { message: 'Sesión ya estaba revocada' };

    sesion.revoked_at = new Date();
    await this.sesionRepo.save(sesion);
    return { message: 'Sesión revocada' };
  }

  async revokeAllExceptCurrent(
    userId: number,
    currentJti: string,
  ): Promise<{ count: number }> {
    const res = await this.sesionRepo
      .createQueryBuilder()
      .update(Sesion)
      .set({ revoked_at: new Date() })
      .where('usuario_id = :uid AND jti != :jti AND revoked_at IS NULL', {
        uid: userId,
        jti: currentJti,
      })
      .execute();
    return { count: res.affected ?? 0 };
  }

  async touchSession(jti: string): Promise<boolean> {
    const sesion = await this.sesionRepo.findOne({ where: { jti } });
    if (!sesion || sesion.revoked_at) return false;
    sesion.last_used_at = new Date();
    await this.sesionRepo.save(sesion);
    return true;
  }

  /**
   * Genera un token de reset. En dev devuelve el token en la respuesta para facilitar testing.
   * En producción (NODE_ENV=production) siempre responde con mensaje genérico, independientemente
   * de si el email existe (para no filtrar qué emails están registrados).
   */
  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<{ message: string; devToken?: string }> {
    const isDev = process.env.NODE_ENV !== 'production';
    const genericMessage =
      'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña.';

    const user = await this.usuarioRepo.findOne({
      where: { email: dto.email },
    });
    if (!user) return { message: genericMessage };

    // Invalida tokens activos anteriores del mismo usuario
    await this.resetRepo.update(
      { usuario_id: user.id, used: false },
      { used: true },
    );

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await this.resetRepo.save(
      this.resetRepo.create({
        usuario_id: user.id,
        token,
        expires_at: expires,
      }),
    );

    const sendResult = await this.mailService.sendPasswordReset(
      user.email,
      token,
      user.nombre,
    );
    if (!isDev) return { message: genericMessage };
    if (sendResult.delivered) return { message: genericMessage };
    return {
      message:
        'Token generado (dev mode). Úsalo en /resetear-contrasena/[token]',
      devToken: token,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const record = await this.resetRepo.findOne({
      where: { token: dto.token },
      relations: ['usuario'],
    });
    if (!record) throw new NotFoundException('Token inválido');
    if (record.used) throw new BadRequestException('Este enlace ya fue usado');
    if (record.expires_at.getTime() < Date.now())
      throw new BadRequestException('El enlace ha expirado');

    if (record.usuario.banned)
      throw new BadRequestException('No se puede restablecer la contraseña');
    record.usuario.password = await bcrypt.hash(dto.newPassword, 10);
    await this.usuarioRepo.save(record.usuario);

    record.used = true;
    await this.resetRepo.save(record);

    // Limpia tokens expirados del mismo usuario como housekeeping
    await this.resetRepo.delete({
      usuario_id: record.usuario_id,
      expires_at: LessThan(new Date()),
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
