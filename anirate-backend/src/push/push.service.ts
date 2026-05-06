import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import {
  Contenido,
  Notificacion,
  PushSubscription,
  Review,
  ReviewRespuesta,
  Usuario,
} from '../database/entities';
import {
  resolveNotificationPushUrl,
  trimFrontendBase,
} from './notification-push-url';

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private ready = false;

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subRepo: Repository<PushSubscription>,
    @InjectRepository(Usuario)
    private readonly userRepo: Repository<Usuario>,
    @InjectRepository(Contenido)
    private readonly contenidoRepo: Repository<Contenido>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(ReviewRespuesta)
    private readonly respuestaRepo: Repository<ReviewRespuesta>,
  ) {}

  onModuleInit(): void {
    const pub = process.env.VAPID_PUBLIC_KEY?.trim();
    const priv = process.env.VAPID_PRIVATE_KEY?.trim();
    const subj = process.env.VAPID_SUBJECT?.trim();
    if (pub && priv && subj) {
      try {
        webpush.setVapidDetails(subj, pub, priv);
        this.ready = true;
        this.logger.log('Web Push VAPID configurado');
      } catch (e) {
        this.logger.warn(
          `Web Push VAPID inválido: ${(e as Error).message}`,
        );
      }
    } else {
      this.logger.warn(
        'Web Push desactivado (faltan VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT)',
      );
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  getVapidPublicKey(): string | null {
    const pub = process.env.VAPID_PUBLIC_KEY?.trim();
    return pub && pub.length > 0 ? pub : null;
  }

  async subscribe(
    userId: number,
    dto: { endpoint: string; p256dh: string; auth: string },
  ): Promise<void> {
    await this.subRepo.delete({ endpoint: dto.endpoint });
    await this.subRepo.save(
      this.subRepo.create({
        usuario_id: userId,
        endpoint: dto.endpoint,
        p256dh: dto.p256dh,
        auth: dto.auth,
      }),
    );
  }

  async unsubscribe(userId: number, endpoint: string): Promise<void> {
    await this.subRepo.delete({ usuario_id: userId, endpoint });
  }

  async removeAllForUser(userId: number): Promise<void> {
    await this.subRepo.delete({ usuario_id: userId });
  }

  async notifyForInAppNotification(n: Notificacion): Promise<void> {
    if (!this.ready) return;
    const user = await this.userRepo.findOne({
      where: { id: n.usuario_id },
      select: ['id', 'banned'],
    });
    if (!user || user.banned) return;

    const subs = await this.subRepo.find({ where: { usuario_id: n.usuario_id } });
    if (subs.length === 0) return;

    const base = trimFrontendBase(process.env.FRONTEND_URL);
    const url = await resolveNotificationPushUrl(
      n.tipo,
      n.referencia_id,
      base,
      {
        contenidoRepo: this.contenidoRepo,
        reviewRepo: this.reviewRepo,
        respuestaRepo: this.respuestaRepo,
      },
    );
    const payload = JSON.stringify({
      title: 'AniRates',
      body: n.mensaje,
      url,
    });

    for (const s of subs) {
      const sub = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      };
      try {
        await webpush.sendNotification(sub, payload, {
          TTL: 60 * 60 * 12,
          urgency: 'normal',
        });
      } catch (e) {
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await this.subRepo.delete({ id: s.id });
        } else {
          this.logger.debug(
            `Push fallo usuario=${n.usuario_id}: ${(e as Error).message}`,
          );
        }
      }
    }
  }
}
