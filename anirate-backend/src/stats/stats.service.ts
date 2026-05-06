import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Contenido, Rating, Review, Usuario } from '../database/entities';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Contenido) private contenidoRepo: Repository<Contenido>,
    @InjectRepository(Rating) private ratingRepo: Repository<Rating>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
  ) {}

  async getGlobal() {
    const [totalContenido, totalRatings, totalReviews, totalUsuarios] =
      await Promise.all([
        this.contenidoRepo.count(),
        this.ratingRepo.count(),
        this.reviewRepo.count(),
        this.usuarioRepo.count(),
      ]);
    return { totalContenido, totalRatings, totalReviews, totalUsuarios };
  }

  async getTopContenido(tipo?: string, limit = 20) {
    const qb = this.ratingRepo
      .createQueryBuilder('r')
      .innerJoin('r.contenido', 'c')
      .select('c.id', 'contenido_id')
      .addSelect('AVG(r.puntuacion)', 'avg_score')
      .addSelect('COUNT(r.id)', 'total')
      .groupBy('c.id')
      .having('COUNT(r.id) >= :min', { min: 1 })
      .orderBy('AVG(r.puntuacion)', 'DESC')
      .limit(limit);
    if (tipo) qb.andWhere('c.tipo = :tipo', { tipo });

    const rows = await qb.getRawMany<{
      contenido_id: number;
      avg_score: number | string;
      total: number | string;
    }>();
    if (rows.length === 0) return [];

    const ids = rows.map((r) => Number(r.contenido_id));
    const contenidos = await this.contenidoRepo.find({
      where: { id: In(ids) },
      relations: ['generos'],
    });
    const map = new Map(contenidos.map((c) => [c.id, c]));

    return rows
      .map((r) => {
        const c = map.get(Number(r.contenido_id));
        if (!c) return null;
        return {
          ...c,
          rating_promedio: Number(r.avg_score),
          total_ratings: Number(r.total),
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }

  async getTopReviews(limit = 10) {
    return this.reviewRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.usuario', 'u')
      .leftJoinAndSelect('r.contenido', 'c')
      .where('r.votos > 0')
      .andWhere('u.shadowbanned = :sb AND u.banned = :bn', {
        sb: false,
        bn: false,
      })
      .orderBy('r.votos', 'DESC')
      .take(limit)
      .getMany();
  }

  async getGeneroStats() {
    // Aggregate avg + count per contenido via Rating
    const aggRows = await this.ratingRepo
      .createQueryBuilder('r')
      .select('r.contenido_id', 'contenido_id')
      .addSelect('AVG(r.puntuacion)', 'avg_score')
      .addSelect('COUNT(r.id)', 'total')
      .groupBy('r.contenido_id')
      .having('COUNT(r.id) >= :min', { min: 1 })
      .getRawMany<{
        contenido_id: number;
        avg_score: number | string;
        total: number | string;
      }>();

    if (aggRows.length === 0) return [];

    const aggMap = new Map<number, { avg: number; total: number }>();
    for (const r of aggRows) {
      aggMap.set(Number(r.contenido_id), {
        avg: Number(r.avg_score),
        total: Number(r.total),
      });
    }

    const ids = [...aggMap.keys()];
    const contenidos = await this.contenidoRepo.find({
      where: { id: In(ids) },
      relations: ['generos'],
    });

    const counts: Record<
      string,
      { nombre: string; count: number; avgRating: number; totalRating: number }
    > = {};
    for (const c of contenidos) {
      const agg = aggMap.get(c.id);
      if (!agg) continue;
      for (const g of c.generos ?? []) {
        if (!counts[g.nombre])
          counts[g.nombre] = {
            nombre: g.nombre,
            count: 0,
            avgRating: 0,
            totalRating: 0,
          };
        counts[g.nombre].count += 1;
        counts[g.nombre].totalRating += agg.avg;
      }
    }

    return Object.values(counts)
      .map((g) => ({
        ...g,
        avgRating: g.count > 0 ? g.totalRating / g.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}
