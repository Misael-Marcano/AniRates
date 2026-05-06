import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ListaPersonalizada,
  ListaPersonalizadaContenido,
} from '../database/entities';
import { ContenidoService } from '../contenido/contenido.service';
import {
  CreateListaPersonalizadaDto,
  UpdateListaPersonalizadaDto,
  AddItemDto,
} from './dto/lista-personalizada.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

@Injectable()
export class ListasPersonalizadasService {
  constructor(
    @InjectRepository(ListaPersonalizada)
    private listaRepo: Repository<ListaPersonalizada>,
    @InjectRepository(ListaPersonalizadaContenido)
    private itemRepo: Repository<ListaPersonalizadaContenido>,
    private contenidoService: ContenidoService,
  ) {}

  async create(userId: number, dto: CreateListaPersonalizadaDto) {
    const base = slugify(dto.nombre);
    let slug = `${base}-${userId}`;
    let n = 1;
    while (await this.listaRepo.findOne({ where: { slug } })) {
      slug = `${base}-${userId}-${n++}`;
    }
    const lista = this.listaRepo.create({
      usuario_id: userId,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      imagen_portada: dto.imagen_portada,
      publica: dto.publica ?? true,
      slug,
    });
    return this.listaRepo.save(lista);
  }

  async update(id: number, userId: number, dto: UpdateListaPersonalizadaDto) {
    const lista = await this.listaRepo.findOne({ where: { id } });
    if (!lista) throw new NotFoundException('Lista no encontrada');
    if (lista.usuario_id !== userId)
      throw new ForbiddenException('No puedes editar esta lista');
    Object.assign(lista, dto);
    return this.listaRepo.save(lista);
  }

  async remove(id: number, userId: number) {
    const lista = await this.listaRepo.findOne({ where: { id } });
    if (!lista) throw new NotFoundException('Lista no encontrada');
    if (lista.usuario_id !== userId)
      throw new ForbiddenException('No puedes eliminar esta lista');
    await this.itemRepo.delete({ lista_id: id });
    await this.listaRepo.delete(id);
  }

  async findByUser(userId: number, viewerId?: number) {
    const qb = this.listaRepo
      .createQueryBuilder('l')
      .where('l.usuario_id = :userId', { userId })
      .orderBy('l.fecha_actualizada', 'DESC');
    if (viewerId !== userId) qb.andWhere('l.publica = :pub', { pub: true });

    const listas = await qb.getMany();
    const result = await Promise.all(
      listas.map(async (l) => {
        const count = await this.itemRepo.count({ where: { lista_id: l.id } });
        return { ...l, itemCount: count };
      }),
    );
    return result;
  }

  async findById(id: number, viewerId?: number) {
    const lista = await this.listaRepo.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!lista) throw new NotFoundException('Lista no encontrada');
    if (!lista.publica && lista.usuario_id !== viewerId)
      throw new ForbiddenException('Lista privada');

    const items = await this.itemRepo.find({
      where: { lista_id: id },
      order: { orden: 'ASC', fecha_agregado: 'DESC' },
    });
    return {
      id: lista.id,
      nombre: lista.nombre,
      descripcion: lista.descripcion,
      imagen_portada: lista.imagen_portada,
      publica: lista.publica,
      slug: lista.slug,
      fecha_creada: lista.fecha_creada,
      fecha_actualizada: lista.fecha_actualizada,
      usuario: { id: lista.usuario.id, nombre: lista.usuario.nombre },
      isOwner: viewerId === lista.usuario_id,
      items,
    };
  }

  async addItem(listaId: number, userId: number, dto: AddItemDto) {
    const lista = await this.listaRepo.findOne({ where: { id: listaId } });
    if (!lista) throw new NotFoundException('Lista no encontrada');
    if (lista.usuario_id !== userId)
      throw new ForbiddenException('No puedes modificar esta lista');

    const contenido = await this.contenidoService.findOrCreateByJikanId({
      jikan_id: dto.jikan_id,
      titulo: dto.titulo,
      tipo: dto.tipo,
      imagen: dto.imagen,
      año: dto.año,
      estado: dto.estado,
      descripcion: dto.descripcion,
    });

    const existing = await this.itemRepo.findOne({
      where: { lista_id: listaId, contenido_id: contenido.id },
    });
    if (existing) {
      if (dto.nota !== undefined) {
        existing.nota = dto.nota;
        await this.itemRepo.save(existing);
      }
      return existing;
    }

    const maxOrden = await this.itemRepo
      .createQueryBuilder('i')
      .where('i.lista_id = :id', { id: listaId })
      .select('MAX(i.orden)', 'max')
      .getRawOne<{ max: number }>();

    const item = this.itemRepo.create({
      lista_id: listaId,
      contenido_id: contenido.id,
      nota: dto.nota,
      orden: (maxOrden?.max ?? -1) + 1,
    });
    const saved = await this.itemRepo.save(item);
    await this.listaRepo.update(listaId, { fecha_actualizada: new Date() });
    return saved;
  }

  async removeItem(listaId: number, itemId: number, userId: number) {
    const lista = await this.listaRepo.findOne({ where: { id: listaId } });
    if (!lista) throw new NotFoundException('Lista no encontrada');
    if (lista.usuario_id !== userId)
      throw new ForbiddenException('No puedes modificar esta lista');
    await this.itemRepo.delete({ id: itemId, lista_id: listaId });
  }

  async listPublic(limit = 20) {
    return this.listaRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.usuario', 'u')
      .where('l.publica = :p', { p: true })
      .orderBy('l.fecha_actualizada', 'DESC')
      .take(limit)
      .getMany();
  }
}
