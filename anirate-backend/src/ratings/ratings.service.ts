import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../database/entities';
import { CreateRatingDto } from './dto/rating.dto';
import { ContenidoService } from '../contenido/contenido.service';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    private readonly contenidoService: ContenidoService,
  ) {}

  async rate(dto: CreateRatingDto, userId: number): Promise<Rating> {
    const contenido = await this.contenidoService.findOrCreateByJikanId({
      jikan_id: dto.jikan_id,
      titulo: dto.titulo,
      tipo: dto.tipo,
      imagen: dto.imagen,
      año: dto.año,
      estado: dto.estado,
      descripcion: dto.descripcion,
    });

    const existing = await this.ratingRepo.findOne({
      where: { usuario_id: userId, contenido_id: contenido.id },
    });
    if (existing) {
      existing.puntuacion = dto.puntuacion;
      return this.ratingRepo.save(existing);
    }
    const rating = this.ratingRepo.create({
      contenido_id: contenido.id,
      puntuacion: dto.puntuacion,
      usuario_id: userId,
    });
    return this.ratingRepo.save(rating);
  }

  async findByContenido(contenidoId: number): Promise<Rating[]> {
    return this.ratingRepo.find({ where: { contenido_id: contenidoId } });
  }

  async findByUser(userId: number): Promise<Rating[]> {
    return this.ratingRepo.find({
      where: { usuario_id: userId },
      order: { fecha: 'DESC' },
    });
  }

  async getDistribution(contenidoId: number): Promise<number[]> {
    const rows = await this.ratingRepo
      .createQueryBuilder('r')
      .select('r.puntuacion', 'puntuacion')
      .addSelect('COUNT(*)', 'count')
      .where('r.contenido_id = :id', { id: contenidoId })
      .groupBy('r.puntuacion')
      .getRawMany<{ puntuacion: number; count: string }>();

    const distribution = new Array(10).fill(0);
    for (const row of rows) {
      const idx = Math.min(Math.max(Math.floor(row.puntuacion) - 1, 0), 9);
      distribution[idx] += Number(row.count);
    }
    return distribution;
  }

  async getDistributionByJikanId(jikanId: number): Promise<number[]> {
    const contenido = await this.contenidoService.findByJikanId(jikanId);
    if (!contenido) return new Array(10).fill(0);
    return this.getDistribution(contenido.id);
  }
}
