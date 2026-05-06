import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListaItem } from '../database/entities';
import { NotificacionesService } from './notificaciones.service';

interface JikanAnimeMin {
  status: string;
  episodes: number | null;
}

const SYNC_COOLDOWN_MS = 30 * 60 * 1000;
const MAX_ITEMS_PER_SYNC = 25;
const JIKAN_DELAY_MS = 400;

@Injectable()
export class AiringSyncService {
  private readonly logger = new Logger(AiringSyncService.name);

  constructor(
    @InjectRepository(ListaItem)
    private readonly listaRepo: Repository<ListaItem>,
    private readonly notificaciones: NotificacionesService,
  ) {}

  async syncForUser(
    userId: number,
  ): Promise<{ checked: number; created: number }> {
    const cutoff = new Date(Date.now() - SYNC_COOLDOWN_MS);
    const items = await this.listaRepo
      .createQueryBuilder('l')
      .innerJoinAndSelect('l.contenido', 'c')
      .where('l.usuario_id = :uid', { uid: userId })
      .andWhere('l.estado IN (:...estados)', {
        estados: ['viendo', 'planificado'],
      })
      .andWhere('c.tipo = :tipo', { tipo: 'ANIME' })
      .andWhere('c.jikan_id IS NOT NULL')
      .andWhere('(l.last_synced_at IS NULL OR l.last_synced_at < :cutoff)', {
        cutoff,
      })
      .orderBy('l.last_synced_at', 'ASC')
      .take(MAX_ITEMS_PER_SYNC)
      .getMany();

    let created = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (i > 0) await this.sleep(JIKAN_DELAY_MS);
      try {
        const data = await this.fetchAnime(item.contenido.jikan_id);
        if (!data) continue;

        const wasPlanificado = item.estado === 'planificado';
        const isAiring = data.status === 'Currently Airing';
        const wasNotAiring =
          item.last_known_status &&
          item.last_known_status !== 'Currently Airing';
        const firstSync = item.last_known_status == null;

        if (
          wasPlanificado &&
          isAiring &&
          (wasNotAiring ||
            (!firstSync && item.last_known_status !== 'Currently Airing'))
        ) {
          await this.notificaciones.create({
            usuario_id: userId,
            tipo: 'lista_inicio',
            mensaje: `"${item.contenido.titulo}" empezó a emitirse`,
            referencia_id: item.contenido.id,
          });
          created++;
        }

        if (
          item.estado === 'viendo' &&
          data.episodes != null &&
          item.last_known_episodes != null &&
          data.episodes > item.last_known_episodes
        ) {
          await this.notificaciones.create({
            usuario_id: userId,
            tipo: 'nuevo_episodio',
            mensaje: `Nuevo episodio de "${item.contenido.titulo}" (ep ${data.episodes})`,
            referencia_id: item.contenido.id,
          });
          created++;
        }

        item.last_known_status = data.status;
        item.last_known_episodes = data.episodes ?? item.last_known_episodes;
        item.last_synced_at = new Date();
        await this.listaRepo.save(item);
      } catch (e) {
        this.logger.warn(
          `Sync failed for jikan ${item.contenido.jikan_id}: ${(e as Error).message}`,
        );
      }
    }
    return { checked: items.length, created };
  }

  private async fetchAnime(jikanId: number): Promise<JikanAnimeMin | null> {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${jikanId}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { data: JikanAnimeMin };
    return json.data;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
