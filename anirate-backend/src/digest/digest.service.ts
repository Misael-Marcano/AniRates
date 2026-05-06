import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Usuario, Seguimiento, Review, Contenido } from '../database/entities';
import { MailService } from '../mail/mail.service';
import { RecomendacionesService } from '../recomendaciones/recomendaciones.service';
import type { RecomendacionItem } from '../recomendaciones/recomendaciones.service';
import { formatDigestLocalizedTimestamp } from '../common/iana-timezone';

const DIGEST_RECO_PICKS = 5;

export interface WeeklyDigestJobResult {
  sent: number;
  skipped: number;
  errors: number;
}

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  constructor(
    @InjectRepository(Usuario) private readonly userRepo: Repository<Usuario>,
    @InjectRepository(Seguimiento)
    private readonly segRepo: Repository<Seguimiento>,
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    private readonly mailService: MailService,
    private readonly recomendacionesService: RecomendacionesService,
  ) {}

  private mergeNotificationPrefs(p: Usuario['notification_prefs']): {
    email_mentions: boolean;
    email_weekly_digest: boolean;
  } {
    return { email_mentions: true, email_weekly_digest: false, ...(p ?? {}) };
  }

  private digestTimezoneLabel(p: Usuario['notification_prefs'] | null): string {
    const raw = p?.digest_timezone?.trim();
    return raw && raw.length > 0 ? raw : 'UTC';
  }

  private async communityPulseSince(
    since: Date,
  ): Promise<{ reviewsPublished: number; newFollows: number }> {
    const reviewsPublished = await this.reviewRepo
      .createQueryBuilder('r')
      .innerJoin('r.usuario', 'u')
      .where('r.fecha >= :since', { since })
      .andWhere('u.shadowbanned = :sb AND u.banned = :bn', {
        sb: false,
        bn: false,
      })
      .getCount();

    const newFollows = await this.segRepo.count({
      where: { fecha: MoreThanOrEqual(since) },
    });

    return { reviewsPublished, newFollows };
  }

  private contenidoAbsoluteUrl(c: Contenido | null | undefined): string {
    const base = (process.env.FRONTEND_URL ?? 'http://localhost:5000').replace(
      /\/$/,
      '',
    );
    if (!c) return base;
    const kind = (c.tipo ?? '').toUpperCase() === 'MANGA' ? 'manga' : 'anime';
    const jid = c.jikan_id ?? c.id;
    return `${base}/contenido/${kind}/${jid}`;
  }

  private recoItemAbsoluteUrl(item: RecomendacionItem): string {
    const base = (process.env.FRONTEND_URL ?? 'http://localhost:5000').replace(
      /\/$/,
      '',
    );
    const kind = (item.tipo ?? '').toUpperCase() === 'MANGA' ? 'manga' : 'anime';
    const jid = item.jikan_id ?? item.contenido_id;
    return `${base}/contenido/${kind}/${jid}`;
  }

  private async digestRecommendationsForUser(
    userId: number,
  ): Promise<{ titulo: string; url: string }[]> {
    try {
      const { items } = await this.recomendacionesService.getForUser(
        userId,
        DIGEST_RECO_PICKS,
      );
      return items.slice(0, DIGEST_RECO_PICKS).map((i) => ({
        titulo: (i.titulo ?? 'Contenido').slice(0, 140),
        url: this.recoItemAbsoluteUrl(i),
      }));
    } catch (e) {
      this.logger.warn(
        `digest recommendations failed user=${userId}: ${(e as Error).message}`,
      );
      return [];
    }
  }

  /** Ventana fija: últimos 7 días (UTC). */
  async runWeeklyDigestJob(): Promise<WeeklyDigestJobResult> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 7);

    const users = await this.userRepo.find({
      where: { email_verificado: true },
      select: [
        'id',
        'email',
        'nombre',
        'notification_prefs',
        'shadowbanned',
        'banned',
      ],
    });
    const subscribers = users.filter(
      (u) =>
        !u.shadowbanned &&
        !u.banned &&
        this.mergeNotificationPrefs(u.notification_prefs).email_weekly_digest,
    );

    const topReviewsRaw = await this.reviewRepo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.usuario', 'u')
      .innerJoinAndSelect('r.contenido', 'c')
      .where('r.fecha >= :since', { since })
      .andWhere('u.shadowbanned = :sb AND u.banned = :bn', {
        sb: false,
        bn: false,
      })
      .orderBy('r.votos', 'DESC')
      .addOrderBy('r.id', 'DESC')
      .take(5)
      .getMany();
    const topReviews = topReviewsRaw.map((r) => ({
      contenidoTitulo: (r.contenido?.titulo ?? 'Contenido').slice(0, 140),
      autorNombre: (r.usuario?.nombre ?? 'Usuario').slice(0, 80),
      votos: r.votos ?? 0,
      url: this.contenidoAbsoluteUrl(r.contenido ?? null),
    }));

    const communityMetrics = await this.communityPulseSince(since);
    const generatedAt = new Date();

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const u of subscribers) {
      const followerRows = await this.segRepo.find({
        where: { seguido_id: u.id, fecha: MoreThanOrEqual(since) },
        relations: ['seguidor'],
        order: { fecha: 'DESC' },
        take: 20,
      });
      const followerNames = followerRows
        .filter(
          (row) =>
            !row.seguidor?.shadowbanned && !row.seguidor?.banned,
        )
        .map((row) => row.seguidor?.nombre)
        .filter((n): n is string => Boolean(n));

      const recommendations = await this.digestRecommendationsForUser(u.id);

      if (
        followerNames.length === 0 &&
        topReviews.length === 0 &&
        recommendations.length === 0
      ) {
        skipped += 1;
        continue;
      }

      try {
        const tz = this.digestTimezoneLabel(u.notification_prefs);
        await this.mailService.sendWeeklyDigest(u.email, {
          nombre: u.nombre,
          followerNames,
          reviews: topReviews,
          recommendations,
          recipientUserId: u.id,
          communityMetrics:
            communityMetrics.reviewsPublished > 0 ||
            communityMetrics.newFollows > 0
              ? communityMetrics
              : undefined,
          digestTimezone: tz,
          digestGeneratedAtLabel: formatDigestLocalizedTimestamp(
            generatedAt,
            tz,
          ),
        });
        sent += 1;
      } catch (e) {
        errors += 1;
        this.logger.warn(
          `digest email failed user=${u.id}: ${(e as Error).message}`,
        );
      }
    }

    this.logger.log(
      `weekly digest: subscribers=${subscribers.length} sent=${sent} skipped=${skipped} errors=${errors}`,
    );
    return { sent, skipped, errors };
  }
}
