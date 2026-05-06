import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import {
  Review,
  ReviewVersion,
  ReviewReport,
  ReviewVoto,
  ReviewRespuesta,
  Usuario,
} from '../database/entities';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { ContenidoService } from '../contenido/contenido.service';
import {
  encodeCursor,
  decodeCursor,
  PaginatedResult,
  clampLimit,
} from '../common/cursor';
import { sanitizeMarkdown } from '../common/sanitize';
import {
  extractMentionUserIdsFromMarkdown,
  mentionUserIdsDelta,
} from '../common/mentions';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import {
  ModeracionAuditService,
  MOD_AUDIT,
} from '../moderacion/moderacion-audit.service';

export type ReviewSort = 'recent' | 'top';

const MAX_IMAGE_URL_LEN = 2048;

/** Menos de N reviews totales → perfil “nuevo”; anti-spam ligero (Sprint 5 / ítem 30). */
const LOW_HISTORY_REVIEW_THRESHOLD = 6;
const MAX_REVIEWS_PER_24H_LOW_HISTORY = 4;
const REVIEW_RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function normalizeReviewImageUrls(urls: string[] | undefined): string[] | null {
  if (!urls) return null;
  const normalized = urls
    .map((raw) => raw.trim())
    .filter((raw) => raw.length > 0 && raw.length <= MAX_IMAGE_URL_LEN)
    .filter((raw) => /^https?:\/\//i.test(raw));
  const deduped = Array.from(new Set(normalized)).slice(0, 3);
  return deduped.length > 0 ? deduped : null;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(ReviewVoto)
    private readonly votoRepo: Repository<ReviewVoto>,
    @InjectRepository(ReviewRespuesta)
    private readonly respuestaRepo: Repository<ReviewRespuesta>,
    @InjectRepository(ReviewVersion)
    private readonly reviewVersionRepo: Repository<ReviewVersion>,
    @InjectRepository(ReviewReport)
    private readonly reviewReportRepo: Repository<ReviewReport>,
    private readonly contenidoService: ContenidoService,
    private readonly notificacionesService: NotificacionesService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly moderacionAudit: ModeracionAuditService,
  ) {}

  async create(dto: CreateReviewDto, userId: number): Promise<Review> {
    const totalReviews = await this.reviewRepo.count({
      where: { usuario_id: userId },
    });
    if (totalReviews < LOW_HISTORY_REVIEW_THRESHOLD) {
      const since = new Date(Date.now() - REVIEW_RATE_WINDOW_MS);
      const recentCount = await this.reviewRepo.count({
        where: { usuario_id: userId, fecha: MoreThan(since) },
      });
      if (recentCount >= MAX_REVIEWS_PER_24H_LOW_HISTORY) {
        throw new HttpException(
          'Has publicado varias reviews muy seguidas. Espera unas horas antes de añadir otra.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const contenido = await this.contenidoService.findOrCreateByJikanId({
      jikan_id: dto.jikan_id,
      titulo: dto.titulo,
      tipo: dto.tipo,
      imagen: dto.imagen,
      año: dto.año,
      estado: dto.estado,
      descripcion: dto.descripcion,
    });

    const existing = await this.reviewRepo.findOne({
      where: { usuario_id: userId, contenido_id: contenido.id },
    });
    if (existing)
      throw new ConflictException(
        'Ya escribiste una review para este contenido',
      );

    const review = this.reviewRepo.create({
      comentario: sanitizeMarkdown(dto.comentario, 5000),
      puntuacion: dto.puntuacion,
      es_spoiler: dto.es_spoiler ?? false,
      imagenes: normalizeReviewImageUrls(dto.imagenes),
      contenido_id: contenido.id,
      usuario_id: userId,
    });
    const saved = await this.reviewRepo.save(review);
    const full = await this.reviewRepo.findOne({
      where: { id: saved.id },
      relations: ['usuario', 'contenido'],
    });
    if (!full) return saved;
    await this.notifyReviewMentions(
      extractMentionUserIdsFromMarkdown(full.comentario),
      userId,
      full.usuario?.nombre ?? 'Alguien',
      full.contenido ?? null,
      full.id,
      'create',
    );
    return full;
  }

  async findByUser(
    userId: number,
    viewerId?: number,
    viewerTipo?: string,
  ): Promise<Review[]> {
    try {
      await this.usersService.assertPublicProfileAccessible(
        userId,
        viewerId,
        viewerTipo,
      );
    } catch {
      return [];
    }
    return this.reviewRepo.find({
      where: { usuario_id: userId },
      relations: ['usuario', 'contenido'],
      order: { fecha: 'DESC' },
    });
  }

  async findByContenido(
    jikanId: number,
    opts: { sort?: ReviewSort; cursor?: string; limit?: unknown } = {},
  ): Promise<PaginatedResult<Review>> {
    const contenido = await this.contenidoService.findByJikanId(jikanId);
    if (!contenido) return { items: [], nextCursor: null };

    const sort: ReviewSort = opts.sort === 'top' ? 'top' : 'recent';
    const limit = clampLimit(opts.limit, 20, 50);
    const cursor = decodeCursor(opts.cursor);

    const qb = this.reviewRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.usuario', 'u')
      .where('r.contenido_id = :cid', { cid: contenido.id })
      .andWhere('u.shadowbanned = :sbx AND u.banned = :bn', {
        sbx: false,
        bn: false,
      });

    if (sort === 'top') {
      qb.orderBy('r.votos', 'DESC').addOrderBy('r.id', 'DESC');
      if (cursor) {
        const votos = Number(cursor.sortKey);
        qb.andWhere(
          '(r.votos < :votos OR (r.votos = :votos AND r.id < :cid_id))',
          { votos, cid_id: cursor.id },
        );
      }
    } else {
      qb.orderBy('r.fecha', 'DESC').addOrderBy('r.id', 'DESC');
      if (cursor) {
        qb.andWhere(
          '(r.fecha < :fecha OR (r.fecha = :fecha AND r.id < :cid_id))',
          { fecha: new Date(cursor.sortKey), cid_id: cursor.id },
        );
      }
    }

    const items = await qb.take(limit + 1).getMany();
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeCursor(
            sort === 'top' ? last.votos : last.fecha.toISOString(),
            last.id,
          )
        : null;

    return { items: page, nextCursor };
  }

  async reportReview(
    reviewId: number,
    reporterId: number,
    motivo?: string,
  ): Promise<{ ok: true }> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException();
    if (review.usuario_id === reporterId) {
      throw new BadRequestException('No puedes reportar tu propia review');
    }
    const dup = await this.reviewReportRepo.exist({
      where: { review_id: reviewId, reporter_id: reporterId },
    });
    if (dup) throw new ConflictException('Ya reportaste esta review');
    const m = motivo ? sanitizeMarkdown(motivo, 500).trim() : null;
    await this.reviewReportRepo.save(
      this.reviewReportRepo.create({
        review_id: reviewId,
        reporter_id: reporterId,
        motivo: m || null,
      }),
    );
    return { ok: true };
  }

  async listReportsForAdmin(userTipo: string): Promise<ReviewReport[]> {
    if (userTipo !== 'admin') throw new ForbiddenException();
    return this.reviewReportRepo.find({
      relations: ['review', 'review.usuario', 'review.contenido', 'reporter'],
      order: { resuelto: 'ASC', fecha: 'DESC' },
      take: 200,
    });
  }

  async setReportResolved(
    reportId: number,
    userTipo: string,
    resuelto: boolean,
    adminUserId: number,
  ): Promise<ReviewReport> {
    if (userTipo !== 'admin') throw new ForbiddenException();
    const r = await this.reviewReportRepo.findOne({ where: { id: reportId } });
    if (!r) throw new NotFoundException();
    r.resuelto = resuelto;
    r.resuelto_en = resuelto ? new Date() : null;
    const saved = await this.reviewReportRepo.save(r);
    await this.moderacionAudit.append(
      adminUserId,
      MOD_AUDIT.REVIEW_REPORT_RESOLVE,
      'review_report',
      reportId,
      { resuelto },
    );
    return saved;
  }

  async listVersions(reviewId: number): Promise<ReviewVersion[]> {
    const exists = await this.reviewRepo.exist({ where: { id: reviewId } });
    if (!exists) throw new NotFoundException();
    return this.reviewVersionRepo.find({
      where: { review_id: reviewId },
      order: { fecha: 'DESC', id: 'DESC' },
      take: 50,
    });
  }

  private async saveVersionSnapshotIfChanged(
    review: Review,
    dto: UpdateReviewDto,
  ): Promise<void> {
    const nextComentario =
      dto.comentario !== undefined
        ? sanitizeMarkdown(dto.comentario, 5000)
        : review.comentario;
    const nextPuntuacion =
      dto.puntuacion !== undefined ? dto.puntuacion : review.puntuacion;
    const nextSpoiler =
      dto.es_spoiler !== undefined ? dto.es_spoiler : review.es_spoiler;
    const nextImagenes =
      dto.imagenes !== undefined
        ? normalizeReviewImageUrls(dto.imagenes)
        : (review.imagenes ?? null);

    const commentChanged =
      dto.comentario !== undefined && nextComentario !== review.comentario;
    const scoreChanged =
      dto.puntuacion !== undefined &&
      (dto.puntuacion ?? null) !== (review.puntuacion ?? null);
    const spoilerChanged =
      dto.es_spoiler !== undefined && nextSpoiler !== review.es_spoiler;
    const imagesChanged =
      dto.imagenes !== undefined &&
      JSON.stringify(nextImagenes ?? []) !==
        JSON.stringify(review.imagenes ?? []);

    if (!commentChanged && !scoreChanged && !spoilerChanged && !imagesChanged)
      return;

    await this.reviewVersionRepo.save(
      this.reviewVersionRepo.create({
        review_id: review.id,
        comentario: review.comentario,
        imagenes: review.imagenes ?? null,
        puntuacion: review.puntuacion ?? null,
        es_spoiler: review.es_spoiler,
      }),
    );
  }

  async update(
    id: number,
    dto: UpdateReviewDto,
    userId: number,
  ): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['usuario', 'contenido'],
    });
    if (!review) throw new NotFoundException();
    if (review.usuario_id !== userId) throw new ForbiddenException();
    const previousComment =
      dto.comentario !== undefined ? review.comentario : '';
    await this.saveVersionSnapshotIfChanged(review, dto);
    if (dto.comentario !== undefined)
      review.comentario = sanitizeMarkdown(dto.comentario, 5000);
    if (dto.puntuacion !== undefined) review.puntuacion = dto.puntuacion;
    if (dto.es_spoiler !== undefined) review.es_spoiler = dto.es_spoiler;
    if (dto.imagenes !== undefined)
      review.imagenes = normalizeReviewImageUrls(dto.imagenes);
    await this.reviewRepo.save(review);
    if (dto.comentario !== undefined) {
      const newly = mentionUserIdsDelta(previousComment, review.comentario);
      const loaded = await this.reviewRepo.findOne({
        where: { id: review.id },
        relations: ['usuario', 'contenido'],
      });
      await this.notifyReviewMentions(
        newly,
        userId,
        loaded?.usuario?.nombre ?? review.usuario?.nombre ?? 'Alguien',
        loaded?.contenido ?? review.contenido ?? null,
        review.id,
        'update',
      );
    }
    return this.reviewRepo.findOne({
      where: { id },
      relations: ['usuario'],
    }) as Promise<Review>;
  }

  async remove(id: number, userId: number): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException();
    if (review.usuario_id !== userId) throw new ForbiddenException();
    await this.votoRepo.delete({ review_id: id });
    await this.reviewRepo.delete(id);
  }

  async updateFeatured(id: number, featured: boolean): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException();
    review.featured = featured;
    await this.reviewRepo.save(review);
    return this.reviewRepo.findOne({
      where: { id },
      relations: ['usuario'],
    }) as Promise<Review>;
  }

  async vote(reviewId: number, userId: number): Promise<{ votos: number }> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException();

    const existing = await this.votoRepo.findOne({
      where: { review_id: reviewId, usuario_id: userId },
    });
    if (existing) return { votos: review.votos };

    await this.votoRepo.save(
      this.votoRepo.create({ review_id: reviewId, usuario_id: userId }),
    );
    review.votos = (review.votos ?? 0) + 1;
    await this.reviewRepo.save(review);

    if (review.usuario_id !== userId) {
      const voter = await this.reviewRepo.manager.findOne(Usuario, {
        where: { id: userId },
        select: ['nombre'],
      });
      const name = voter?.nombre?.trim() || 'Alguien';
      await this.notificacionesService.create({
        usuario_id: review.usuario_id,
        tipo: 'voto_review',
        mensaje: `"${name}" marcó tu review como útil.`,
        referencia_id: reviewId,
      });
    }

    return { votos: review.votos };
  }

  async unvote(reviewId: number, userId: number): Promise<{ votos: number }> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException();

    const existing = await this.votoRepo.findOne({
      where: { review_id: reviewId, usuario_id: userId },
    });
    if (!existing) return { votos: review.votos };

    await this.votoRepo.delete({ review_id: reviewId, usuario_id: userId });
    review.votos = Math.max(0, (review.votos ?? 0) - 1);
    await this.reviewRepo.save(review);
    return { votos: review.votos };
  }

  async getMyVotes(userId: number, jikanId: number): Promise<number[]> {
    const contenido = await this.contenidoService.findByJikanId(jikanId);
    if (!contenido) return [];
    const reviews = await this.reviewRepo.find({
      where: { contenido_id: contenido.id },
      select: ['id'],
    });
    const reviewIds = reviews.map((r) => r.id);
    if (reviewIds.length === 0) return [];
    const votos = await this.votoRepo.find({
      where: reviewIds.map((id) => ({ review_id: id, usuario_id: userId })),
    });
    return votos.map((v) => v.review_id);
  }

  async listReplies(reviewId: number): Promise<ReviewRespuesta[]> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException();
    return this.respuestaRepo.find({
      where: { review_id: reviewId },
      order: { fecha: 'ASC' },
    });
  }

  async createReply(
    reviewId: number,
    userId: number,
    comentario: string,
  ): Promise<ReviewRespuesta> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException();
    const reply = this.respuestaRepo.create({
      review_id: reviewId,
      usuario_id: userId,
      comentario: sanitizeMarkdown(comentario, 1500),
    });
    const saved = await this.respuestaRepo.save(reply);
    const full = await this.respuestaRepo.findOne({
      where: { id: saved.id },
      relations: ['usuario', 'review', 'review.contenido'],
    });
    if (!full) return saved;
    await this.notifyReplyMentions(
      extractMentionUserIdsFromMarkdown(full.comentario),
      userId,
      full.usuario?.nombre ?? 'Alguien',
      full.id,
      full.review?.contenido ?? null,
    );
    return full;
  }

  async deleteReply(replyId: number, userId: number): Promise<void> {
    const reply = await this.respuestaRepo.findOne({ where: { id: replyId } });
    if (!reply) throw new NotFoundException();
    if (reply.usuario_id !== userId) throw new ForbiddenException();
    await this.respuestaRepo.delete(replyId);
  }

  async getCountsByJikanIds(
    jikanIds: number[],
  ): Promise<Record<number, number>> {
    if (jikanIds.length === 0) return {};
    const rows = await this.reviewRepo
      .createQueryBuilder('r')
      .innerJoin('r.contenido', 'c')
      .innerJoin('r.usuario', 'u')
      .select('c.jikan_id', 'jikan_id')
      .addSelect('COUNT(r.id)', 'count')
      .where('c.jikan_id IN (:...ids)', { ids: jikanIds })
      .andWhere('u.shadowbanned = :sb AND u.banned = :bn', {
        sb: false,
        bn: false,
      })
      .groupBy('c.jikan_id')
      .getRawMany<{ jikan_id: number; count: string }>();
    const result: Record<number, number> = {};
    for (const id of jikanIds) result[id] = 0;
    for (const r of rows) result[Number(r.jikan_id)] = Number(r.count);
    return result;
  }

  private buildContenidoPublicUrl(
    c: { tipo: string; jikan_id: number | null; id: number } | null,
  ): string | null {
    if (!c) return null;
    const base = (process.env.FRONTEND_URL ?? 'http://localhost:5000').replace(
      /\/$/,
      '',
    );
    const kind = (c.tipo ?? '').toUpperCase() === 'MANGA' ? 'manga' : 'anime';
    const jid = c.jikan_id ?? c.id;
    if (!Number.isFinite(Number(jid))) return null;
    return `${base}/contenido/${kind}/${jid}`;
  }

  private async sendMentionEmails(
    mentionUserIds: number[],
    authorName: string,
    messageLine: string,
    ctaUrl: string | null,
    tipo: 'mencion_review' | 'mencion_respuesta',
  ): Promise<void> {
    if (mentionUserIds.length === 0) return;
    const recipients =
      await this.usersService.findMentionEmailRecipients(mentionUserIds, tipo);
    const fallback = (
      process.env.FRONTEND_URL ?? 'http://localhost:5000'
    ).replace(/\/$/, '');
    const url = ctaUrl && ctaUrl.length > 0 ? ctaUrl : fallback;
    const label = ctaUrl ? 'Ver contenido' : 'Abrir AniRate';
    for (const { email, id } of recipients) {
      void this.mailService
        .sendMentionNotice(email, {
          authorName,
          messageLine,
          ctaUrl: url,
          ctaLabel: label,
          recipientUserId: id,
        })
        .catch(() => {});
    }
  }

  private async notifyReviewMentions(
    rawIds: number[],
    authorId: number,
    authorName: string,
    contenido: {
      titulo: string;
      tipo: string;
      jikan_id: number | null;
      id: number;
    } | null,
    reviewId: number,
    context: 'create' | 'update',
  ): Promise<void> {
    const ids = [...new Set(rawIds)];
    if (ids.length === 0) return;
    const valid = await this.usersService.filterExistingUserIds(ids);
    const titulo = contenido?.titulo ?? null;
    const tituloSnippet = titulo
      ? ` sobre «${titulo.slice(0, 80)}${titulo.length > 80 ? '…' : ''}»`
      : '';
    const msgBase =
      context === 'create'
        ? `"${authorName}" te mencionó en una review${tituloSnippet}.`
        : `"${authorName}" te volvió a mencionar en una review${tituloSnippet}.`;
    const targets = valid.filter((uid) => uid !== authorId);
    for (const uid of targets) {
      await this.notificacionesService.create({
        usuario_id: uid,
        tipo: 'mencion_review',
        mensaje: msgBase,
        referencia_id: reviewId,
      });
    }
    await this.sendMentionEmails(
      targets,
      authorName,
      msgBase,
      this.buildContenidoPublicUrl(contenido),
      'mencion_review',
    );
  }

  private async notifyReplyMentions(
    rawIds: number[],
    authorId: number,
    authorName: string,
    replyId: number,
    contenido: { tipo: string; jikan_id: number | null; id: number } | null,
  ): Promise<void> {
    const ids = [...new Set(rawIds)];
    if (ids.length === 0) return;
    const valid = await this.usersService.filterExistingUserIds(ids);
    const msg = `"${authorName}" te mencionó en una respuesta a una review.`;
    const targets = valid.filter((uid) => uid !== authorId);
    for (const uid of targets) {
      await this.notificacionesService.create({
        usuario_id: uid,
        tipo: 'mencion_respuesta',
        mensaje: msg,
        referencia_id: replyId,
      });
    }
    await this.sendMentionEmails(
      targets,
      authorName,
      msg,
      this.buildContenidoPublicUrl(contenido),
      'mencion_respuesta',
    );
  }
}
