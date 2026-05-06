import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListaItem } from '../database/entities';
import { UpsertListaDto, UpdateListaDto } from './dto/lista.dto';
import { ContenidoService } from '../contenido/contenido.service';

@Injectable()
export class ListaService {
  constructor(
    @InjectRepository(ListaItem)
    private readonly listaRepo: Repository<ListaItem>,
    private readonly contenidoService: ContenidoService,
  ) {}

  async upsert(dto: UpsertListaDto, userId: number): Promise<ListaItem> {
    const contenido = await this.contenidoService.findOrCreateByJikanId({
      jikan_id: dto.jikan_id,
      titulo: dto.titulo,
      tipo: dto.tipo,
      imagen: dto.imagen,
      año: dto.año,
      estado: dto.estado_contenido,
      descripcion: dto.descripcion,
    });

    const existing = await this.listaRepo.findOne({
      where: { usuario_id: userId, contenido_id: contenido.id },
    });

    if (existing) {
      existing.estado = dto.estado;
      if (dto.progreso !== undefined) existing.progreso = dto.progreso;
      if (dto.nota_personal !== undefined)
        existing.nota_personal = dto.nota_personal;
      return this.listaRepo.save(existing);
    }

    const item = this.listaRepo.create({
      usuario_id: userId,
      contenido_id: contenido.id,
      estado: dto.estado,
      progreso: dto.progreso,
      nota_personal: dto.nota_personal,
    });
    return this.listaRepo.save(item);
  }

  async update(
    id: number,
    dto: UpdateListaDto,
    userId: number,
  ): Promise<ListaItem> {
    const item = await this.listaRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    if (item.usuario_id !== userId) throw new ForbiddenException();
    if (dto.estado !== undefined) item.estado = dto.estado;
    if (dto.progreso !== undefined) item.progreso = dto.progreso;
    if (dto.nota_personal !== undefined) item.nota_personal = dto.nota_personal;
    return this.listaRepo.save(item);
  }

  async remove(id: number, userId: number): Promise<void> {
    const item = await this.listaRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    if (item.usuario_id !== userId) throw new ForbiddenException();
    await this.listaRepo.delete(id);
  }

  async findByUser(userId: number): Promise<ListaItem[]> {
    return this.listaRepo.find({
      where: { usuario_id: userId },
      relations: ['contenido'],
      order: { fecha_actualizado: 'DESC' },
    });
  }

  async findItemByContenido(
    userId: number,
    jikanId: number,
  ): Promise<ListaItem | null> {
    const items = await this.listaRepo.find({
      where: { usuario_id: userId },
      relations: ['contenido'],
    });
    return items.find((i) => i.contenido?.jikan_id === jikanId) ?? null;
  }
}
