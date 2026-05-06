import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../database/entities';
import { MailMetricsService } from './mail-metrics.service';

function normalizeRecipient(email: string): string {
  return email.trim().toLowerCase();
}

function extractRecipients(data: Record<string, unknown>): string[] {
  const raw = data.to;
  if (Array.isArray(raw)) {
    return raw
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map(normalizeRecipient);
  }
  if (typeof raw === 'string' && raw.trim())
    return [normalizeRecipient(raw)];
  return [];
}

function bounceDetail(data: Record<string, unknown>): {
  type?: string;
  message?: string;
} {
  const b = data.bounce;
  if (!b || typeof b !== 'object') return {};
  const o = b as Record<string, unknown>;
  return {
    type: typeof o.type === 'string' ? o.type : undefined,
    message: typeof o.message === 'string' ? o.message : undefined,
  };
}

/** Permanent / suppressed bounces → stop sending; temporary may recover. */
function shouldSuppressFromBounceData(data: Record<string, unknown>): boolean {
  const { type } = bounceDetail(data);
  if (type === 'Temporary') return false;
  return true;
}

function parseTopLevel(body: unknown): {
  type: string;
  data: Record<string, unknown>;
} | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const type = o.type;
  const data = o.data;
  if (typeof type !== 'string' || !type.trim()) return null;
  if (!data || typeof data !== 'object') return null;
  return { type: type.trim(), data: data as Record<string, unknown> };
}

@Injectable()
export class ResendWebhookService {
  private readonly logger = new Logger(ResendWebhookService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly mailMetrics: MailMetricsService,
  ) {}

  private async findUserByEmailNorm(
    emailNorm: string,
  ): Promise<Usuario | null> {
    return this.usuarioRepo
      .createQueryBuilder('u')
      .where('LOWER(LTRIM(RTRIM(u.email))) = :email', { email: emailNorm })
      .getOne();
  }

  /**
   * Procesa eventos JSON de Resend (`type` + `data`), p. ej. email.bounced / email.complained.
   * Firma HTTP sigue en el controlador (Bearer secret).
   */
  async handleWebhookPayload(body: unknown): Promise<void> {
    const parsed = parseTopLevel(body);
    this.mailMetrics.recordWebhookEvent();

    if (!parsed) {
      this.logger.warn('[resend webhook] payload sin type/data reconocibles');
      return;
    }

    const { type, data } = parsed;

    if (type === 'email.delivered') {
      this.mailMetrics.recordWebhookDeliveredEvent();
      const emails = extractRecipients(data);
      this.logger.debug(
        `[resend webhook] delivered to=${emails.join(',') || '?'}`,
      );
      return;
    }

    if (type === 'email.bounced') {
      if (!shouldSuppressFromBounceData(data)) {
        this.mailMetrics.recordWebhookSoftBounceSkipped();
        this.logger.debug(
          `[resend webhook] soft bounce skipped to=${extractRecipients(data).join(',')}`,
        );
        return;
      }
      const reasonPrefix = 'email.bounced';
      const { type: bType, message } = bounceDetail(data);
      const reasonBase = [bType, message].filter(Boolean).join(': ');
      const reason = `${reasonPrefix}${reasonBase ? ` ${reasonBase}` : ''}`.slice(
        0,
        500,
      );
      await this.applySuppression(extractRecipients(data), reason);
      return;
    }

    if (type === 'email.complained') {
      await this.applySuppression(extractRecipients(data), 'email.complained');
      return;
    }

    this.logger.debug(`[resend webhook] tipo no gestionado: ${type}`);
  }

  private async applySuppression(
    emails: string[],
    reason: string,
  ): Promise<void> {
    if (emails.length === 0) {
      this.logger.warn('[resend webhook] sin destinatarios en data.to');
      return;
    }

    for (const emailNorm of emails) {
      const user = await this.findUserByEmailNorm(emailNorm);
      if (!user) {
        this.mailMetrics.recordWebhookUnknownRecipient();
        this.logger.warn(
          `[resend webhook] sin usuario para email=${emailNorm}`,
        );
        continue;
      }
      if (user.email_delivery_suppressed_at) {
        this.mailMetrics.recordWebhookSuppressionDuplicate();
        continue;
      }
      user.email_delivery_suppressed_at = new Date();
      user.email_suppression_reason = reason.slice(0, 500);
      await this.usuarioRepo.save(user);
      this.mailMetrics.recordWebhookSuppressionNew();
      this.logger.warn(
        `[resend webhook] suprimido envío usuario_id=${user.id} email=${emailNorm}`,
      );
    }
  }
}
