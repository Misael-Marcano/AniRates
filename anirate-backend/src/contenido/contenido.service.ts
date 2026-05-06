import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contenido, ContenidoReport, Rating } from '../database/entities';
import { CreateContenidoDto } from './dto/contenido.dto';
import { ReportContenidoDto } from './dto/report-contenido.dto';
import { sanitizePlainText } from '../common/sanitize';
import {
  ModeracionAuditService,
  MOD_AUDIT,
} from '../moderacion/moderacion-audit.service';

@Injectable()
export class ContenidoService {
  constructor(
    @InjectRepository(Contenido)
    private readonly contenidoRepo: Repository<Contenido>,
    @InjectRepository(ContenidoReport)
    private readonly contenidoReportRepo: Repository<ContenidoReport>,
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    private readonly moderacionAudit: ModeracionAuditService,
  ) {}

  private async enrichWithRatings(items: Contenido[]): Promise<Contenido[]> {
    const ids = items.map((c) => c.id);
    if (ids.length === 0) return items;

    const stats: { contenido_id: number; avg: number; count: number }[] =
      await this.ratingRepo
        .createQueryBuilder('r')
        .select('r.contenido_id', 'contenido_id')
        .addSelect('AVG(r.puntuacion)', 'avg')
        .addSelect('COUNT(*)', 'count')
        .where('r.contenido_id IN (:...ids)', { ids })
        .groupBy('r.contenido_id')
        .getRawMany();

    const map = new Map(stats.map((s) => [s.contenido_id, s]));
    return items.map((c) => ({
      ...c,
      rating_promedio: map.get(c.id)
        ? +parseFloat(String(map.get(c.id)!.avg)).toFixed(1)
        : 0,
      total_ratings: map.get(c.id) ? Number(map.get(c.id)!.count) : 0,
    }));
  }

  async findAll(tipo?: string, limit = 20): Promise<Contenido[]> {
    const qb = this.contenidoRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.generos', 'g');
    if (tipo) qb.where('c.tipo = :tipo', { tipo });
    qb.take(limit);
    const items = await qb.getMany();
    return this.enrichWithRatings(items);
  }

  async findOne(id: number): Promise<Contenido> {
    const item = await this.contenidoRepo.findOne({
      where: { id },
      relations: ['generos'],
    });
    if (!item) throw new NotFoundException('Contenido no encontrado');
    const [enriched] = await this.enrichWithRatings([item]);
    return enriched;
  }

  async findTop(limit = 10): Promise<Contenido[]> {
    const subQuery = this.ratingRepo
      .createQueryBuilder('r')
      .select('r.contenido_id')
      .addSelect('AVG(r.puntuacion)', 'avg_rating')
      .groupBy('r.contenido_id')
      .orderBy('avg_rating', 'DESC')
      .limit(limit);

    const topIds: { contenido_id: number }[] = await subQuery.getRawMany();
    if (topIds.length === 0) return this.findAll(undefined, limit);

    const ids = topIds.map((r) => r.contenido_id);
    const items = await this.contenidoRepo.find({
      where: ids.map((id) => ({ id })),
      relations: ['generos'],
    });
    return this.enrichWithRatings(items);
  }

  async search(q: string): Promise<Contenido[]> {
    const items = await this.contenidoRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.generos', 'g')
      .where('LOWER(c.titulo) LIKE :q', { q: `%${q.toLowerCase()}%` })
      .take(30)
      .getMany();
    return this.enrichWithRatings(items);
  }

  async create(dto: CreateContenidoDto): Promise<Contenido> {
    const item = this.contenidoRepo.create(dto);
    return this.contenidoRepo.save(item);
  }

  async findByJikanId(jikanId: number): Promise<Contenido | null> {
    return this.contenidoRepo.findOne({ where: { jikan_id: jikanId } });
  }

  /** Upsert por jikan_id: devuelve el registro existente o lo crea. Tolerante a race conditions gracias al UNIQUE en jikan_id. */
  async findOrCreateByJikanId(data: {
    jikan_id: number;
    titulo: string;
    tipo: string;
    descripcion?: string;
    imagen?: string;
    año?: number;
    estado?: string;
  }): Promise<Contenido> {
    const existing = await this.contenidoRepo.findOne({
      where: { jikan_id: data.jikan_id },
    });
    if (existing) return existing;
    try {
      const item = this.contenidoRepo.create(data as Partial<Contenido>);
      return await this.contenidoRepo.save(item);
    } catch (err) {
      // El UNIQUE constraint puede fallar si otro request creó la fila en paralelo: re-consultar.
      const now = await this.contenidoRepo.findOne({
        where: { jikan_id: data.jikan_id },
      });
      if (now) return now;
      throw err;
    }
  }

  async update(
    id: number,
    dto: Partial<CreateContenidoDto>,
  ): Promise<Contenido> {
    await this.contenidoRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.contenidoRepo.delete(id);
  }

  async reportContenido(
    jikanId: number,
    reporterId: number,
    dto: ReportContenidoDto,
  ): Promise<{ ok: true }> {
    const tipoNorm =
      dto.tipo.toUpperCase() === 'MANGA' ? 'MANGA' : 'ANIME';
    const contenido = await this.findOrCreateByJikanId({
      jikan_id: jikanId,
      titulo: sanitizePlainText(dto.titulo, 200),
      tipo: tipoNorm,
    });
    const dup = await this.contenidoReportRepo.exist({
      where: { contenido_id: contenido.id, reporter_id: reporterId },
    });
    if (dup) throw new ConflictException('Ya reportaste esta obra');
    const m = dto.motivo ? sanitizePlainText(dto.motivo, 500).trim() : null;
    await this.contenidoReportRepo.save(
      this.contenidoReportRepo.create({
        contenido_id: contenido.id,
        reporter_id: reporterId,
        motivo: m || null,
      }),
    );
    return { ok: true };
  }

  async listContenidoReportsForAdmin(
    userTipo: string,
  ): Promise<ContenidoReport[]> {
    if (userTipo !== 'admin') throw new ForbiddenException();
    return this.contenidoReportRepo.find({
      relations: ['contenido', 'reporter'],
      order: { resuelto: 'ASC', fecha: 'DESC' },
      take: 200,
    });
  }

  async setContenidoReportResolved(
    reportId: number,
    userTipo: string,
    resuelto: boolean,
    adminUserId: number,
  ): Promise<ContenidoReport> {
    if (userTipo !== 'admin') throw new ForbiddenException();
    const r = await this.contenidoReportRepo.findOne({
      where: { id: reportId },
    });
    if (!r) throw new NotFoundException();
    r.resuelto = resuelto;
    r.resuelto_en = resuelto ? new Date() : null;
    const saved = await this.contenidoReportRepo.save(r);
    await this.moderacionAudit.append(
      adminUserId,
      MOD_AUDIT.CONTENIDO_REPORT_RESOLVE,
      'contenido_report',
      reportId,
      { resuelto },
    );
    return saved;
  }
}
