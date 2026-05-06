import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from '../database/entities';
import { CreateFavoriteDto } from './dto/favorite.dto';
import { ContenidoService } from '../contenido/contenido.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorito)
    private readonly favRepo: Repository<Favorito>,
    private readonly contenidoService: ContenidoService,
  ) {}

  async add(dto: CreateFavoriteDto, userId: number): Promise<Favorito> {
    // Garantizar que el contenido existe en la BD (upsert por jikan_id)
    const contenido = await this.contenidoService.findOrCreateByJikanId({
      jikan_id: dto.jikan_id,
      titulo: dto.titulo,
      tipo: dto.tipo,
      imagen: dto.imagen,
      año: dto.año,
      estado: dto.estado,
      descripcion: dto.descripcion,
    });

    const existing = await this.favRepo.findOne({
      where: { usuario_id: userId, contenido_id: contenido.id },
    });
    if (existing) throw new ConflictException('Ya está en favoritos');

    const fav = this.favRepo.create({
      usuario_id: userId,
      contenido_id: contenido.id,
    });
    await this.favRepo.save(fav);
    return this.favRepo.findOne({
      where: { usuario_id: userId, contenido_id: contenido.id },
    }) as Promise<Favorito>;
  }

  async remove(id: number, userId: number): Promise<void> {
    const fav = await this.favRepo.findOne({ where: { id } });
    if (!fav) throw new NotFoundException();
    if (fav.usuario_id !== userId) throw new ForbiddenException();
    await this.favRepo.delete(id);
  }

  async findByUser(userId: number): Promise<Favorito[]> {
    return this.favRepo.find({
      where: { usuario_id: userId },
      relations: ['contenido'],
    });
  }
}
