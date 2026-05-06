import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import {
  Usuario,
  Seguimiento,
  Favorito,
  Review,
  Rating,
  ListaItem,
  ReviewVoto,
  ReviewRespuesta,
  Notificacion,
  Sesion,
  ListaPersonalizada,
  ListaPersonalizadaContenido,
  TwoFactorSecret,
  EmailVerificationToken,
  PasswordResetToken,
  UserReport,
  ContenidoReport,
  ModeracionLog,
} from '../database/entities';
import { sanitizePlainText } from '../common/sanitize';
import {
  mergeNotificationPrefs,
  effectiveTipoChannelsGrid,
  notificationChannelEnabled,
} from '../common/notification-prefs';
import {
  ModeracionAuditService,
  MOD_AUDIT,
} from '../moderacion/moderacion-audit.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario) private userRepo: Repository<Usuario>,
    @InjectRepository(UserReport) private userReportRepo: Repository<UserReport>,
    @InjectRepository(Seguimiento) private follows: Repository<Seguimiento>,
    @InjectRepository(Favorito) private favs: Repository<Favorito>,
    @InjectRepository(Review) private reviews: Repository<Review>,
    @InjectRepository(Rating) private ratings: Repository<Rating>,
    @InjectRepository(ListaItem) private lista: Repository<ListaItem>,
    private readonly dataSource: DataSource,
    private readonly moderacionAudit: ModeracionAuditService,
  ) {}

  async exportData(userId: number): Promise<Record<string, unknown>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    const [favs, reviews, ratings, lista, follows, listas] = await Promise.all([
      this.favs.find({ where: { usuario_id: userId } }),
      this.reviews.find({ where: { usuario_id: userId } }),
      this.ratings.find({ where: { usuario_id: userId } }),
      this.lista.find({ where: { usuario_id: userId } }),
      this.follows.find({
        where: [{ seguidor_id: userId }, { seguido_id: userId }],
      }),
      this.dataSource
        .getRepository(ListaPersonalizada)
        .find({ where: { usuario_id: userId } }),
    ]);
    return {
      exported_at: new Date().toISOString(),
      schema_version: 1,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        tipo: user.tipo,
        bio: user.bio,
        avatar_url: user.avatar_url,
        email_verificado: user.email_verificado,
        two_factor_enabled: user.two_factor_enabled,
        shadowbanned: user.shadowbanned,
        banned: user.banned,
        notification_prefs: user.notification_prefs ?? null,
      },
      favoritos: favs,
      reviews,
      ratings,
      lista_seguimiento: lista,
      seguimientos: follows,
      listas_personalizadas: listas,
    };
  }

  async deleteAccount(userId: number): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    await this.dataSource.transaction(async (m) => {
      await m.getRepository(ReviewVoto).delete({ usuario_id: userId });
      await m.getRepository(ReviewRespuesta).delete({ usuario_id: userId });
      const userReviews = await m
        .getRepository(Review)
        .find({ where: { usuario_id: userId }, select: ['id'] });
      if (userReviews.length) {
        await m
          .getRepository(ReviewRespuesta)
          .delete({ review_id: In(userReviews.map((r) => r.id)) });
        await m
          .getRepository(ReviewVoto)
          .delete({ review_id: In(userReviews.map((r) => r.id)) });
      }
      await m.getRepository(Review).delete({ usuario_id: userId });
      await m.getRepository(Rating).delete({ usuario_id: userId });
      await m.getRepository(Favorito).delete({ usuario_id: userId });
      await m.getRepository(ListaItem).delete({ usuario_id: userId });
      await m.getRepository(Notificacion).delete({ usuario_id: userId });
      await m
        .getRepository(Seguimiento)
        .delete([{ seguidor_id: userId }, { seguido_id: userId }] as never);
      const userListas = await m
        .getRepository(ListaPersonalizada)
        .find({ where: { usuario_id: userId }, select: ['id'] });
      if (userListas.length) {
        await m
          .getRepository(ListaPersonalizadaContenido)
          .delete({ lista_id: In(userListas.map((l) => l.id)) });
      }
      await m.getRepository(ListaPersonalizada).delete({ usuario_id: userId });
      await m.getRepository(Sesion).delete({ usuario_id: userId });
      await m.getRepository(TwoFactorSecret).delete({ usuario_id: userId });
      await m
        .getRepository(EmailVerificationToken)
        .delete({ usuario_id: userId });
      await m.getRepository(PasswordResetToken).delete({ usuario_id: userId });
      await m.getRepository(UserReport).delete({ reporter_id: userId });
      await m.getRepository(UserReport).delete({ reported_user_id: userId });
      await m.getRepository(ContenidoReport).delete({ reporter_id: userId });
      await m.getRepository(ModeracionLog).delete({ admin_id: userId });
      await m.getRepository(Usuario).delete({ id: userId });
    });
    return { message: 'Cuenta eliminada' };
  }

  async getPublicProfile(id: number, viewerId?: number, viewerTipo?: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (
      (user.shadowbanned || user.banned) &&
      viewerId !== id &&
      viewerTipo !== 'admin'
    ) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const [
      favCount,
      reviewCount,
      ratingCount,
      listaCount,
      completados,
      followersCount,
      followingCount,
    ] = await Promise.all([
      this.favs.count({ where: { usuario_id: id } }),
      this.reviews.count({ where: { usuario_id: id } }),
      this.ratings.count({ where: { usuario_id: id } }),
      this.lista.count({ where: { usuario_id: id } }),
      this.lista.count({ where: { usuario_id: id, estado: 'completado' } }),
      this.follows.count({ where: { seguido_id: id } }),
      this.follows.count({ where: { seguidor_id: id } }),
    ]);

    let isFollowing = false;
    if (viewerId && viewerId !== id) {
      isFollowing = !!(await this.follows.findOne({
        where: { seguidor_id: viewerId, seguido_id: id },
      }));
    }

    // Estimación de horas: ~5h por serie completada (12 ep × 25min promedio)
    const horas_estimadas = completados * 5;

    return {
      id: user.id,
      nombre: user.nombre,
      bio: user.bio ?? null,
      avatar_url: user.avatar_url ?? null,
      stats: {
        favoritos: favCount,
        reviews: reviewCount,
        ratings: ratingCount,
        lista: listaCount,
        completados,
        horas_estimadas,
        seguidores: followersCount,
        siguiendo: followingCount,
      },
      isFollowing,
      isSelf: viewerId === id,
    };
  }

  async getMe(userId: number) {
    const profile = await this.getPublicProfile(userId, userId, undefined);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const defaults = {
      email_mentions: true as boolean,
      email_weekly_digest: false as boolean,
      push_in_app_browser: false as boolean,
    };
    const merged = mergeNotificationPrefs(user?.notification_prefs);
    const notification_prefs = {
      ...defaults,
      ...(user?.notification_prefs ?? {}),
      tipo_channels: effectiveTipoChannelsGrid(merged),
    };
    return { ...profile, email: user?.email ?? null, notification_prefs };
  }

  async getBadges(userId: number, viewerId?: number, viewerTipo?: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (
      (user.shadowbanned || user.banned) &&
      viewerId !== userId &&
      viewerTipo !== 'admin'
    ) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const [reviews, ratings, completados, followers, following, favs] =
      await Promise.all([
        this.reviews.count({ where: { usuario_id: userId } }),
        this.ratings.count({ where: { usuario_id: userId } }),
        this.lista.count({
          where: { usuario_id: userId, estado: 'completado' },
        }),
        this.follows.count({ where: { seguido_id: userId } }),
        this.follows.count({ where: { seguidor_id: userId } }),
        this.favs.count({ where: { usuario_id: userId } }),
      ]);

    const defs: {
      id: string;
      label: string;
      icon: string;
      description: string;
      unlocked: boolean;
      progress?: { value: number; target: number };
    }[] = [
      {
        id: 'primer_review',
        label: 'Primera review',
        icon: 'edit_note',
        description: 'Escribe tu primera review',
        unlocked: reviews >= 1,
        progress: { value: reviews, target: 1 },
      },
      {
        id: 'critico',
        label: 'Crítico',
        icon: 'rate_review',
        description: '10 reviews escritas',
        unlocked: reviews >= 10,
        progress: { value: reviews, target: 10 },
      },
      {
        id: 'supercritico',
        label: 'Súper crítico',
        icon: 'auto_stories',
        description: '50 reviews escritas',
        unlocked: reviews >= 50,
        progress: { value: reviews, target: 50 },
      },
      {
        id: 'calificador',
        label: 'Calificador',
        icon: 'star_half',
        description: '10 títulos calificados',
        unlocked: ratings >= 10,
        progress: { value: ratings, target: 10 },
      },
      {
        id: 'explorador',
        label: 'Explorador',
        icon: 'travel_explore',
        description: '50 títulos calificados',
        unlocked: ratings >= 50,
        progress: { value: ratings, target: 50 },
      },
      {
        id: 'completista',
        label: 'Completista',
        icon: 'task_alt',
        description: '10 series completadas',
        unlocked: completados >= 10,
        progress: { value: completados, target: 10 },
      },
      {
        id: 'maratonista',
        label: 'Maratonista',
        icon: 'local_fire_department',
        description: '50 series completadas',
        unlocked: completados >= 50,
        progress: { value: completados, target: 50 },
      },
      {
        id: 'social_starter',
        label: 'Conectado',
        icon: 'group_add',
        description: 'Sigue a 5 usuarios',
        unlocked: following >= 5,
        progress: { value: following, target: 5 },
      },
      {
        id: 'popular',
        label: 'Popular',
        icon: 'public',
        description: '10 seguidores',
        unlocked: followers >= 10,
        progress: { value: followers, target: 10 },
      },
      {
        id: 'coleccionista',
        label: 'Coleccionista',
        icon: 'collections_bookmark',
        description: '5 favoritos guardados',
        unlocked: favs >= 5,
        progress: { value: favs, target: 5 },
      },
    ];

    return defs;
  }

  async follow(seguidorId: number, seguidoId: number) {
    if (seguidorId === seguidoId)
      throw new BadRequestException('No te puedes seguir a ti mismo');
    const target = await this.userRepo.findOne({ where: { id: seguidoId } });
    if (!target) throw new NotFoundException('Usuario no encontrado');
    const existing = await this.follows.findOne({
      where: { seguidor_id: seguidorId, seguido_id: seguidoId },
    });
    if (existing) return existing;
    return this.follows.save(
      this.follows.create({ seguidor_id: seguidorId, seguido_id: seguidoId }),
    );
  }

  async unfollow(seguidorId: number, seguidoId: number) {
    await this.follows.delete({
      seguidor_id: seguidorId,
      seguido_id: seguidoId,
    });
  }

  async reportUser(
    reporterId: number,
    reportedUserId: number,
    motivo?: string,
  ): Promise<{ ok: true }> {
    if (reporterId === reportedUserId) {
      throw new BadRequestException('No puedes reportarte a ti mismo');
    }
    const exists = await this.userRepo.exist({ where: { id: reportedUserId } });
    if (!exists) throw new NotFoundException();
    const dup = await this.userReportRepo.exist({
      where: {
        reported_user_id: reportedUserId,
        reporter_id: reporterId,
      },
    });
    if (dup) throw new ConflictException('Ya reportaste a este usuario');
    const m = motivo ? sanitizePlainText(motivo, 500).trim() : null;
    await this.userReportRepo.save(
      this.userReportRepo.create({
        reported_user_id: reportedUserId,
        reporter_id: reporterId,
        motivo: m || null,
      }),
    );
    return { ok: true };
  }

  async listUserReportsForAdmin(userTipo: string): Promise<UserReport[]> {
    if (userTipo !== 'admin') throw new ForbiddenException();
    return this.userReportRepo.find({
      relations: ['reported_user', 'reporter'],
      order: { resuelto: 'ASC', fecha: 'DESC' },
      take: 200,
    });
  }

  async setUserReportResolved(
    reportId: number,
    userTipo: string,
    resuelto: boolean,
    adminUserId: number,
  ): Promise<UserReport> {
    if (userTipo !== 'admin') throw new ForbiddenException();
    const r = await this.userReportRepo.findOne({ where: { id: reportId } });
    if (!r) throw new NotFoundException();
    r.resuelto = resuelto;
    r.resuelto_en = resuelto ? new Date() : null;
    const saved = await this.userReportRepo.save(r);
    await this.moderacionAudit.append(
      adminUserId,
      MOD_AUDIT.USER_REPORT_RESOLVE,
      'user_report',
      reportId,
      { resuelto },
    );
    return saved;
  }

  async getFollowers(id: number, viewerId?: number, viewerTipo?: string) {
    await this.assertPublicProfileAccessible(id, viewerId, viewerTipo);
    const rows = await this.follows.find({
      where: { seguido_id: id },
      relations: ['seguidor'],
      order: { fecha: 'DESC' },
    });
    return rows.map((r) => ({
      id: r.seguidor.id,
      nombre: r.seguidor.nombre,
      fecha: r.fecha,
    }));
  }

  async getFollowing(id: number, viewerId?: number, viewerTipo?: string) {
    await this.assertPublicProfileAccessible(id, viewerId, viewerTipo);
    const rows = await this.follows.find({
      where: { seguidor_id: id },
      relations: ['seguido'],
      order: { fecha: 'DESC' },
    });
    return rows.map((r) => ({
      id: r.seguido.id,
      nombre: r.seguido.nombre,
      fecha: r.fecha,
    }));
  }

  async getFeed(userId: number, limit = 30) {
    const following = await this.follows.find({
      where: { seguidor_id: userId },
    });
    const ids = following.map((f) => f.seguido_id);
    if (ids.length === 0) return [];

    const [reviews, ratings, listaItems] = await Promise.all([
      this.reviews.find({
        where: { usuario_id: In(ids) },
        relations: ['usuario', 'contenido'],
        order: { fecha: 'DESC' },
        take: limit,
      }),
      this.ratings.find({
        where: { usuario_id: In(ids) },
        relations: ['usuario', 'contenido'],
        order: { fecha: 'DESC' },
        take: limit,
      }),
      this.lista.find({
        where: { usuario_id: In(ids) },
        relations: ['usuario', 'contenido'],
        order: { fecha_actualizado: 'DESC' },
        take: limit,
      }),
    ]);

    const eventsRaw = [
      ...reviews.map((r) => ({
        tipo: 'review' as const,
        fecha: r.fecha,
        usuario: r.usuario,
        contenido: r.contenido,
        payload: {
          comentario: r.comentario,
          puntuacion: r.puntuacion,
          imagenes: r.imagenes ?? null,
        },
      })),
      ...ratings.map((r) => ({
        tipo: 'rating' as const,
        fecha: r.fecha,
        usuario: r.usuario,
        contenido: r.contenido,
        payload: { puntuacion: r.puntuacion },
      })),
      ...listaItems.map((l) => ({
        tipo: 'lista' as const,
        fecha: l.fecha_actualizado,
        usuario: l.usuario,
        contenido: l.contenido,
        payload: { estado: l.estado },
      })),
    ];
    const events = eventsRaw
      .filter((e) => !e.usuario?.shadowbanned && !e.usuario?.banned)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, limit);

    return events;
  }

  async searchUsers(query: string, limit = 10) {
    if (!query || query.length < 2) return [];
    return this.userRepo
      .createQueryBuilder('u')
      .where('u.nombre LIKE :q', { q: `%${query}%` })
      .andWhere('u.shadowbanned = :sb', { sb: false })
      .andWhere('u.banned = :bn', { bn: false })
      .select(['u.id', 'u.nombre'])
      .take(limit)
      .getMany();
  }

  async adminLookupUsers(q: string, limit = 15, actorTipo?: string) {
    if (actorTipo !== 'admin') throw new ForbiddenException();
    if (!q || q.length < 2) return [];
    return this.userRepo
      .createQueryBuilder('u')
      .where('u.nombre LIKE :q', { q: `%${q}%` })
      .select(['u.id', 'u.nombre', 'u.shadowbanned', 'u.banned'])
      .orderBy('u.nombre', 'ASC')
      .take(limit)
      .getMany();
  }

  async setShadowban(
    actorTipo: string,
    targetUserId: number,
    shadowbanned: boolean,
    adminUserId: number,
  ): Promise<{ id: number; shadowbanned: boolean }> {
    if (actorTipo !== 'admin') throw new ForbiddenException();
    const u = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!u) throw new NotFoundException();
    u.shadowbanned = shadowbanned;
    await this.userRepo.save(u);
    await this.moderacionAudit.append(
      adminUserId,
      shadowbanned ? MOD_AUDIT.SHADOWBAN_ON : MOD_AUDIT.SHADOWBAN_OFF,
      'usuario',
      targetUserId,
      { shadowbanned },
    );
    return { id: u.id, shadowbanned: u.shadowbanned };
  }

  async setBanned(
    actorTipo: string,
    targetUserId: number,
    banned: boolean,
    adminUserId: number,
  ): Promise<{ id: number; banned: boolean }> {
    if (actorTipo !== 'admin') throw new ForbiddenException();
    if (adminUserId === targetUserId) {
      throw new BadRequestException('No puedes suspender tu propia cuenta');
    }
    const u = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!u) throw new NotFoundException();
    u.banned = banned;
    if (banned) u.shadowbanned = false;
    await this.userRepo.save(u);
    if (banned) {
      await this.dataSource
        .getRepository(Sesion)
        .createQueryBuilder()
        .update(Sesion)
        .set({ revoked_at: new Date() })
        .where('usuario_id = :uid AND revoked_at IS NULL', {
          uid: targetUserId,
        })
        .execute();
    }
    await this.moderacionAudit.append(
      adminUserId,
      banned ? MOD_AUDIT.BAN_ON : MOD_AUDIT.BAN_OFF,
      'usuario',
      targetUserId,
      { banned },
    );
    return { id: u.id, banned: u.banned };
  }

  /** Perfil público accesible (no shadowbanado para este visitante). */
  async assertPublicProfileAccessible(
    profileUserId: number,
    viewerId?: number,
    viewerTipo?: string,
  ): Promise<void> {
    const u = await this.userRepo.findOne({
      where: { id: profileUserId },
      select: ['id', 'shadowbanned', 'banned'],
    });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    if (
      (u.shadowbanned || u.banned) &&
      viewerId !== profileUserId &&
      viewerTipo !== 'admin'
    ) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  /** Returns IDs that exist in DB (subset of input, preserves no order guarantee). */
  async filterExistingUserIds(ids: number[]): Promise<number[]> {
    const uniq = [...new Set(ids.filter((n) => Number.isFinite(n) && n > 0))];
    if (uniq.length === 0) return [];
    const rows = await this.userRepo.find({
      where: { id: In(uniq), shadowbanned: false, banned: false },
      select: ['id'],
    });
    return rows.map((r) => r.id);
  }

  /**
   * Usuarios con email verificado que aceptan avisos por correo de menciones (misma semántica que getMe).
   */
  async findMentionEmailRecipients(
    userIds: number[],
    tipo: 'mencion_review' | 'mencion_respuesta',
  ): Promise<Array<{ id: number; email: string }>> {
    const uniq = [
      ...new Set(userIds.filter((n) => Number.isFinite(n) && n > 0)),
    ];
    if (uniq.length === 0) return [];
    const rows = await this.userRepo.find({
      where: {
        id: In(uniq),
        email_verificado: true,
        shadowbanned: false,
        banned: false,
      },
      select: ['id', 'email', 'notification_prefs'],
    });
    return rows
      .filter((u) => {
        const merged = mergeNotificationPrefs(u.notification_prefs);
        return notificationChannelEnabled(merged, tipo, 'email');
      })
      .map((u) => ({ id: u.id, email: u.email }));
  }
}
