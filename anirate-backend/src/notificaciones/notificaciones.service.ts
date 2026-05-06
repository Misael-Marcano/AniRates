import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion, Usuario } from '../database/entities';
import {
  encodeCursor,
  decodeCursor,
  PaginatedResult,
  clampLimit,
} from '../common/cursor';
import {
  mergeNotificationPrefs,
  notificationChannelEnabled,
} from '../common/notification-prefs';
import { PushService } from '../push/push.service';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly repo: Repository<Notificacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly pushService: PushService,
  ) {}

  async create(data: {
    usuario_id: number;
    tipo: string;
    mensaje: string;
    referencia_id?: number;
  }): Promise<Notificacion | null> {
    const user = await this.usuarioRepo.findOne({
      where: { id: data.usuario_id },
      select: ['id', 'banned', 'notification_prefs'],
    });
    if (!user || user.banned) return null;

    const merged = mergeNotificationPrefs(user.notification_prefs);
    const allowInApp = notificationChannelEnabled(
      merged,
      data.tipo,
      'in_app',
    );
    const allowPush = notificationChannelEnabled(merged, data.tipo, 'push');

    let saved: Notificacion | null = null;
    if (allowInApp) {
      saved = await this.repo.save(this.repo.create(data));
    }

    if (allowPush) {
      const n: Notificacion =
        saved ??
        ({
          id: 0,
          usuario_id: data.usuario_id,
          tipo: data.tipo,
          mensaje: data.mensaje,
          referencia_id: data.referencia_id ?? null,
          leida: false,
          fecha: new Date(),
        } as Notificacion);
      void this.pushService.notifyForInAppNotification(n).catch(() => {});
    }

    return saved;
  }

  async findByUser(
    userId: number,
    opts: { cursor?: string; limit?: unknown } = {},
  ): Promise<PaginatedResult<Notificacion>> {
    const limit = clampLimit(opts.limit, 20, 50);
    const cursor = decodeCursor(opts.cursor);

    const qb = this.repo
      .createQueryBuilder('n')
      .where('n.usuario_id = :uid', { uid: userId })
      .orderBy('n.fecha', 'DESC')
      .addOrderBy('n.id', 'DESC')
      .take(limit + 1);

    if (cursor) {
      qb.andWhere('(n.fecha < :fecha OR (n.fecha = :fecha AND n.id < :cid))', {
        fecha: new Date(cursor.sortKey),
        cid: cursor.id,
      });
    }

    const items = await qb.getMany();
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last ? encodeCursor(last.fecha.toISOString(), last.id) : null;
    return { items: page, nextCursor };
  }

  async markRead(id: number, userId: number): Promise<void> {
    await this.repo.update({ id, usuario_id: userId }, { leida: true });
  }

  async markAllRead(userId: number): Promise<void> {
    await this.repo.update(
      { usuario_id: userId, leida: false },
      { leida: true },
    );
  }

  async countUnread(userId: number): Promise<number> {
    return this.repo.count({ where: { usuario_id: userId, leida: false } });
  }
}
