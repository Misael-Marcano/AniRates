import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Usuario } from '../database/entities';
import {
  welcomeEmail,
  verifyEmail,
  resetPasswordEmail,
  mentionNoticeEmail,
  weeklyDigestEmail,
  newLoginAlertEmail,
} from './templates';
import {
  createEmailUnsubscribeToken,
  type EmailUnsubscribeScope,
} from '../common/email-unsubscribe-token';
import { MailMetricsService } from './mail-metrics.service';

export interface SendResult {
  delivered: boolean;
  messageId?: string;
  devToken?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly from: string;
  private readonly frontendUrl: string;
  private readonly appName = 'AniRate';

  constructor(
    private readonly mailMetrics: MailMetricsService,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {
    this.from = process.env.MAIL_FROM ?? 'AniRate <noreply@anirate.local>';
    this.frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5000';
    this.transporter = this.buildTransporter();
  }

  private buildTransporter(): Transporter | null {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      this.logger.log('Mail provider: Resend (SMTP)');
      return nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: { user: 'resend', pass: resendKey },
      });
    }

    const host = process.env.SMTP_HOST;
    if (host) {
      this.logger.log(`Mail provider: SMTP (${host})`);
      return nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT ?? '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      });
    }

    this.logger.warn(
      'Mail provider: NONE (dev mode — los emails se loguean en consola)',
    );
    return null;
  }

  private get isDev(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  /** Enlace firmado (≈1 año) hacia `/email/unsubscribe` en el frontend. */
  buildEmailUnsubscribeUrl(
    recipientUserId: number,
    scope: EmailUnsubscribeScope,
  ): string | undefined {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) return undefined;
    const token = createEmailUnsubscribeToken(recipientUserId, scope, secret);
    return `${this.frontendUrl.replace(/\/$/, '')}/email/unsubscribe?token=${encodeURIComponent(token)}`;
  }

  /** URL del API para RFC 8058 (POST one-click); requiere HTTPS en producción. */
  private buildOneClickUnsubscribeUrl(
    recipientUserId: number,
    scope: EmailUnsubscribeScope,
  ): string | undefined {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) return undefined;
    const token = createEmailUnsubscribeToken(recipientUserId, scope, secret);
    const base =
      process.env.BACKEND_URL?.trim().replace(/\/$/, '') ??
      `http://localhost:${process.env.PORT ?? '5001'}`;
    return `${base}/auth/email-unsubscribe/one-click?token=${encodeURIComponent(token)}`;
  }

  private listUnsubscribeHeaders(
    recipientUserId: number,
    scope: EmailUnsubscribeScope,
  ): Record<string, string> | undefined {
    const url = this.buildOneClickUnsubscribeUrl(recipientUserId, scope);
    if (!url) return undefined;
    return {
      'List-Unsubscribe': `<${url}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
  }

  private async isRecipientSuppressed(to: string): Promise<boolean> {
    const norm = to.trim().toLowerCase();
    if (!norm) return false;
    const row = await this.usuarioRepo
      .createQueryBuilder('u')
      .select(['u.id'])
      .where('LOWER(LTRIM(RTRIM(u.email))) = :email', { email: norm })
      .andWhere('u.email_delivery_suppressed_at IS NOT NULL')
      .getOne();
    return row != null;
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    text: string,
    headers?: Record<string, string>,
  ): Promise<SendResult> {
    if (await this.isRecipientSuppressed(to)) {
      this.mailMetrics.recordSmtpSkippedSuppressed();
      this.logger.debug(`Envío omitido (suppressed): ${to}`);
      return { delivered: false };
    }
    if (!this.transporter) {
      this.mailMetrics.recordConsoleOnly();
      this.logger.debug(`[DEV MAIL] to=${to} subject="${subject}"\n${text}`);
      return { delivered: false };
    }
    this.mailMetrics.recordSmtpAttempt();
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
        text,
        ...(headers ? { headers } : {}),
      });
      this.mailMetrics.recordSmtpDelivered();
      return { delivered: true, messageId: info.messageId };
    } catch (err) {
      const msg = (err as Error).message;
      this.mailMetrics.recordSmtpFailed(msg);
      this.logger.error(`Error enviando email a ${to}: ${msg}`);
      if (this.isDev) return { delivered: false };
      throw err;
    }
  }

  async sendWelcome(to: string, nombre: string): Promise<SendResult> {
    const tpl = welcomeEmail({
      appName: this.appName,
      frontendUrl: this.frontendUrl,
      nombre,
    });
    return this.send(to, tpl.subject, tpl.html, tpl.text);
  }

  async sendVerifyEmail(
    to: string,
    token: string,
    nombre?: string,
  ): Promise<SendResult> {
    const tpl = verifyEmail({
      appName: this.appName,
      frontendUrl: this.frontendUrl,
      nombre,
      token,
    });
    const result = await this.send(to, tpl.subject, tpl.html, tpl.text);
    if (this.isDev && !result.delivered) result.devToken = token;
    return result;
  }

  async sendPasswordReset(
    to: string,
    token: string,
    nombre?: string,
  ): Promise<SendResult> {
    const tpl = resetPasswordEmail({
      appName: this.appName,
      frontendUrl: this.frontendUrl,
      nombre,
      token,
    });
    const result = await this.send(to, tpl.subject, tpl.html, tpl.text);
    if (this.isDev && !result.delivered) result.devToken = token;
    return result;
  }

  async sendMentionNotice(
    to: string,
    opts: {
      authorName: string;
      messageLine: string;
      ctaUrl: string;
      ctaLabel?: string;
      recipientUserId?: number;
    },
  ): Promise<SendResult> {
    const unsubUrl =
      opts.recipientUserId != null
        ? this.buildEmailUnsubscribeUrl(opts.recipientUserId, 'mentions')
        : undefined;
    const tpl = mentionNoticeEmail({
      appName: this.appName,
      frontendUrl: this.frontendUrl,
      authorName: opts.authorName,
      messageLine: opts.messageLine,
      ctaUrl: opts.ctaUrl,
      ctaLabel: opts.ctaLabel ?? 'Ver en AniRate',
      unsubscribeUrl: unsubUrl,
    });
    const ls =
      opts.recipientUserId != null
        ? this.listUnsubscribeHeaders(opts.recipientUserId, 'mentions')
        : undefined;
    return this.send(to, tpl.subject, tpl.html, tpl.text, ls);
  }

  async sendWeeklyDigest(
    to: string,
    opts: {
      nombre?: string;
      followerNames: string[];
      reviews: {
        contenidoTitulo: string;
        autorNombre: string;
        votos: number;
        url: string;
      }[];
      recommendations?: { titulo: string; url: string }[];
      recipientUserId?: number;
      communityMetrics?: { reviewsPublished: number; newFollows: number };
      digestTimezone?: string;
      digestGeneratedAtLabel?: string;
    },
  ): Promise<SendResult> {
    const unsubUrl =
      opts.recipientUserId != null
        ? this.buildEmailUnsubscribeUrl(opts.recipientUserId, 'digest')
        : undefined;
    const tpl = weeklyDigestEmail({
      appName: this.appName,
      frontendUrl: this.frontendUrl,
      recipientNombre: opts.nombre,
      followerNames: opts.followerNames,
      reviews: opts.reviews,
      recommendations: opts.recommendations,
      unsubscribeUrl: unsubUrl,
      communityMetrics: opts.communityMetrics,
      digestTimezone: opts.digestTimezone,
      digestGeneratedAtLabel: opts.digestGeneratedAtLabel,
    });
    const ls =
      opts.recipientUserId != null
        ? this.listUnsubscribeHeaders(opts.recipientUserId, 'digest')
        : undefined;
    return this.send(to, tpl.subject, tpl.html, tpl.text, ls);
  }

  async sendNewLoginAlert(
    to: string,
    opts: { nombre?: string; ip: string; userAgent: string },
  ): Promise<SendResult> {
    const uaHint =
      opts.userAgent.trim().length > 160
        ? `${opts.userAgent.trim().slice(0, 160)}…`
        : opts.userAgent.trim();
    const tpl = newLoginAlertEmail({
      appName: this.appName,
      frontendUrl: this.frontendUrl,
      nombre: opts.nombre,
      ip: opts.ip || '—',
      uaHint: uaHint || '—',
    });
    return this.send(to, tpl.subject, tpl.html, tpl.text);
  }
}
