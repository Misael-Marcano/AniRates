import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Rating, Favorito, ListaItem, Contenido } from '../database/entities';
import { CacheService } from '../cache/cache.service';

const HIGH_RATING_THRESHOLD = 7;
const MIN_RATINGS_FOR_CF = 3;
const CACHE_TTL_SEC = 30 * 60;
const MAX_NEIGHBORS = 200;

export interface RecomendacionItem {
  contenido_id: number;
  jikan_id: number | null;
  titulo: string;
  imagen: string | null;
  tipo: string;
  año: number | null;
  score: number;
  rating_promedio: number;
  total_ratings: number;
  source_jikan_id: number | null;
  source_titulo: string | null;
  generos?: { id: number; nombre: string }[];
}

interface CacheEntry {
  items: RecomendacionItem[];
  strategy: 'cf' | 'content' | 'cold';
}

@Injectable()
export class RecomendacionesService {
  constructor(
    @InjectRepository(Rating) private ratingRepo: Repository<Rating>,
    @InjectRepository(Favorito) private favRepo: Repository<Favorito>,
    @InjectRepository(ListaItem) private listaRepo: Repository<ListaItem>,
    @InjectRepository(Contenido) private contenidoRepo: Repository<Contenido>,
    private readonly cache: CacheService,
  ) {}

  private cacheKey(userId: number): string {
    return `reco:user:${userId}`;
  }

  async getForUser(
    userId: number,
    limit = 20,
  ): Promise<{ items: RecomendacionItem[]; strategy: string }> {
    const cached = await this.cache.get<CacheEntry>(this.cacheKey(userId));
    if (cached) {
      return { items: cached.items.slice(0, limit), strategy: cached.strategy };
    }

    const userRatings = await this.ratingRepo.find({
      where: { usuario_id: userId },
    });
    const userHighRatings = userRatings.filter(
      (r) => r.puntuacion >= HIGH_RATING_THRESHOLD,
    );

    const seenIds = await this.getSeenContenidoIds(userId);

    let items: RecomendacionItem[];
    let strategy: 'cf' | 'content' | 'cold';

    if (userHighRatings.length < MIN_RATINGS_FOR_CF) {
      items = await this.contentBased(userId, seenIds, limit);
      strategy = userHighRatings.length === 0 ? 'cold' : 'content';
    } else {
      items = await this.collaborativeFiltering(
        userId,
        userHighRatings,
        seenIds,
        limit,
      );
      if (items.length < limit / 2) {
        const fill = await this.contentBased(
          userId,
          seenIds,
          limit - items.length,
        );
        const haveIds = new Set(items.map((i) => i.contenido_id));
        items.push(...fill.filter((f) => !haveIds.has(f.contenido_id)));
      }
      strategy = 'cf';
    }

    await this.cache.set<CacheEntry>(
      this.cacheKey(userId),
      { items, strategy },
      CACHE_TTL_SEC,
    );
    return { items: items.slice(0, limit), strategy };
  }

  invalidate(userId: number): void {
    void this.cache.del(this.cacheKey(userId));
  }

  private async getSeenContenidoIds(userId: number): Promise<Set<number>> {
    const [ratings, favs, lista] = await Promise.all([
      this.ratingRepo.find({
        where: { usuario_id: userId },
        select: ['contenido_id'],
      }),
      this.favRepo.find({
        where: { usuario_id: userId },
        select: ['contenido_id'],
      }),
      this.listaRepo.find({
        where: { usuario_id: userId },
        select: ['contenido_id'],
      }),
    ]);
    const ids = new Set<number>();
    ratings.forEach((r) => ids.add(r.contenido_id));
    favs.forEach((f) => ids.add(f.contenido_id));
    lista.forEach((l) => ids.add(l.contenido_id));
    return ids;
  }

  private async collaborativeFiltering(
    userId: number,
    userHighRatings: Rating[],
    seenIds: Set<number>,
    limit: number,
  ): Promise<RecomendacionItem[]> {
    const userHighIds = userHighRatings.map((r) => r.contenido_id);
    const userHighSet = new Set(userHighIds);

    const neighborRows = await this.ratingRepo
      .createQueryBuilder('r')
      .select('r.usuario_id', 'usuario_id')
      .addSelect('COUNT(*)', 'overlap')
      .where('r.contenido_id IN (:...ids)', { ids: userHighIds })
      .andWhere('r.puntuacion >= :th', { th: HIGH_RATING_THRESHOLD })
      .andWhere('r.usuario_id != :uid', { uid: userId })
      .groupBy('r.usuario_id')
      .orderBy('overlap', 'DESC')
      .limit(MAX_NEIGHBORS)
      .getRawMany<{ usuario_id: number; overlap: string }>();

    if (neighborRows.length === 0) return [];

    const neighborIds = neighborRows.map((n) => n.usuario_id);

    const neighborRatings = await this.ratingRepo
      .createQueryBuilder('r')
      .where('r.usuario_id IN (:...nids)', { nids: neighborIds })
      .andWhere('r.puntuacion >= :th', { th: HIGH_RATING_THRESHOLD })
      .getMany();

    const neighborHighByUser = new Map<number, Set<number>>();
    for (const r of neighborRatings) {
      if (!neighborHighByUser.has(r.usuario_id))
        neighborHighByUser.set(r.usuario_id, new Set());
      neighborHighByUser.get(r.usuario_id)!.add(r.contenido_id);
    }

    const candidateScores = new Map<
      number,
      { score: number; sourceId: number | null; weight: number }
    >();

    for (const [neighborId, neighborSet] of neighborHighByUser.entries()) {
      const intersection = [...neighborSet].filter((id) =>
        userHighSet.has(id),
      ).length;
      const union = neighborSet.size + userHighSet.size - intersection;
      if (union === 0 || intersection === 0) continue;
      const similarity = intersection / union;

      for (const cid of neighborSet) {
        if (userHighSet.has(cid) || seenIds.has(cid)) continue;
        const prev = candidateScores.get(cid) ?? {
          score: 0,
          sourceId: null,
          weight: 0,
        };
        prev.score += similarity;
        prev.weight += 1;
        if (!prev.sourceId) {
          const sample =
            [...neighborSet].find((id) => userHighSet.has(id)) ?? null;
          prev.sourceId = sample;
        }
        candidateScores.set(cid, prev);
      }
    }

    const minWeight = neighborHighByUser.size >= 5 ? 2 : 1;
    const filtered = [...candidateScores.entries()]
      .filter(([, v]) => v.weight >= minWeight)
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit * 2);

    if (filtered.length === 0) return [];

    const ids = filtered.map(([id]) => id);
    const sourceIds = [
      ...new Set(
        filtered
          .map(([, v]) => v.sourceId)
          .filter((x): x is number => x !== null),
      ),
    ];

    const [contenidos, sources] = await Promise.all([
      this.contenidoRepo.find({
        where: { id: In(ids) },
        relations: ['generos'],
      }),
      sourceIds.length > 0
        ? this.contenidoRepo.find({
            where: { id: In(sourceIds) },
            select: ['id', 'jikan_id', 'titulo'],
          })
        : Promise.resolve([]),
    ]);

    const stats = await this.getRatingStats(ids);
    const sourceMap = new Map(sources.map((s) => [s.id, s]));
    const contenidoMap = new Map(contenidos.map((c) => [c.id, c]));

    const result: RecomendacionItem[] = [];
    for (const [cid, v] of filtered) {
      const c = contenidoMap.get(cid);
      if (!c) continue;
      const src = v.sourceId ? sourceMap.get(v.sourceId) : null;
      const stat = stats.get(cid);
      result.push({
        contenido_id: c.id,
        jikan_id: c.jikan_id ?? null,
        titulo: c.titulo,
        imagen: c.imagen ?? null,
        tipo: c.tipo,
        año: c.año ?? null,
        score: +v.score.toFixed(3),
        rating_promedio: stat?.avg ?? 0,
        total_ratings: stat?.count ?? 0,
        source_jikan_id: src?.jikan_id ?? null,
        source_titulo: src?.titulo ?? null,
        generos: c.generos?.map((g) => ({ id: g.id, nombre: g.nombre })) ?? [],
      });
      if (result.length >= limit) break;
    }
    return result;
  }

  private async contentBased(
    userId: number,
    seenIds: Set<number>,
    limit: number,
  ): Promise<RecomendacionItem[]> {
    const userRatings = await this.ratingRepo.find({
      where: { usuario_id: userId },
      relations: ['contenido', 'contenido.generos'],
    });

    const genreFreq = new Map<number, { count: number; nombre: string }>();
    for (const r of userRatings) {
      if (r.puntuacion < 6) continue;
      for (const g of r.contenido?.generos ?? []) {
        const prev = genreFreq.get(g.id) ?? { count: 0, nombre: g.nombre };
        prev.count += r.puntuacion >= HIGH_RATING_THRESHOLD ? 2 : 1;
        genreFreq.set(g.id, prev);
      }
    }

    const topGenreIds = [...genreFreq.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([id]) => id);

    if (topGenreIds.length === 0) {
      const idRows = await this.contenidoRepo
        .createQueryBuilder('c')
        .select('c.id', 'id')
        .orderBy('NEWID()')
        .take(limit * 2)
        .getRawMany<{ id: number }>();
      const ids = idRows
        .map((r) => r.id)
        .filter((id) => !seenIds.has(id))
        .slice(0, limit);
      if (ids.length === 0) return [];
      const fallback = await this.contenidoRepo.find({
        where: { id: In(ids) },
        relations: ['generos'],
      });
      const ordered = ids
        .map((id) => fallback.find((c) => c.id === id))
        .filter((c): c is Contenido => Boolean(c));
      return this.toRecomendacionItems(ordered, null);
    }

    const idsRowsQb = this.contenidoRepo
      .createQueryBuilder('c')
      .select('c.id', 'id')
      .innerJoin('Contenido_Genero', 'cg', 'cg.contenidoId = c.id')
      .where('cg.generoId IN (:...gids)', { gids: topGenreIds });

    if (seenIds.size > 0) {
      idsRowsQb.andWhere('c.id NOT IN (:...seen)', { seen: [...seenIds] });
    }

    const idsRows = await idsRowsQb
      .groupBy('c.id')
      .orderBy('COUNT(cg.generoId)', 'DESC')
      .take(limit * 2)
      .getRawMany<{ id: number }>();

    if (idsRows.length === 0) return [];

    const candidateIds = idsRows.slice(0, limit).map((r) => r.id);
    const candidates = await this.contenidoRepo.find({
      where: { id: In(candidateIds) },
      relations: ['generos'],
    });

    return this.toRecomendacionItems(candidates, null);
  }

  private async toRecomendacionItems(
    items: Contenido[],
    sourceTitulo: string | null,
  ): Promise<RecomendacionItem[]> {
    if (items.length === 0) return [];
    const ids = items.map((c) => c.id);
    const stats = await this.getRatingStats(ids);
    return items.map((c) => {
      const stat = stats.get(c.id);
      return {
        contenido_id: c.id,
        jikan_id: c.jikan_id ?? null,
        titulo: c.titulo,
        imagen: c.imagen ?? null,
        tipo: c.tipo,
        año: c.año ?? null,
        score: stat?.avg ?? 0,
        rating_promedio: stat?.avg ?? 0,
        total_ratings: stat?.count ?? 0,
        source_jikan_id: null,
        source_titulo: sourceTitulo,
        generos: c.generos?.map((g) => ({ id: g.id, nombre: g.nombre })) ?? [],
      };
    });
  }

  private async getRatingStats(
    contenidoIds: number[],
  ): Promise<Map<number, { avg: number; count: number }>> {
    if (contenidoIds.length === 0) return new Map();
    const rows = await this.ratingRepo
      .createQueryBuilder('r')
      .select('r.contenido_id', 'contenido_id')
      .addSelect('AVG(r.puntuacion)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.contenido_id IN (:...ids)', { ids: contenidoIds })
      .groupBy('r.contenido_id')
      .getRawMany<{ contenido_id: number; avg: string; count: string }>();
    return new Map(
      rows.map((r) => [
        r.contenido_id,
        { avg: +parseFloat(r.avg).toFixed(1), count: Number(r.count) },
      ]),
    );
  }
}
