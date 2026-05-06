import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ListasPersonalizadasService } from './listas-personalizadas.service';
import { ContenidoService } from '../contenido/contenido.service';
import {
  ListaPersonalizada,
  ListaPersonalizadaContenido,
} from '../database/entities';

describe('ListasPersonalizadasService', () => {
  let service: ListasPersonalizadasService;
  let listaRepo: jest.Mocked<Repository<ListaPersonalizada>>;
  let itemRepo: jest.Mocked<Repository<ListaPersonalizadaContenido>>;
  let contenidoService: jest.Mocked<ContenidoService>;

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        ListasPersonalizadasService,
        {
          provide: getRepositoryToken(ListaPersonalizada),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ListaPersonalizadaContenido),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: ContenidoService,
          useValue: { findOrCreateByJikanId: jest.fn() },
        },
      ],
    }).compile();

    service = mod.get(ListasPersonalizadasService);
    listaRepo = mod.get(getRepositoryToken(ListaPersonalizada));
    itemRepo = mod.get(getRepositoryToken(ListaPersonalizadaContenido));
    contenidoService = mod.get(ContenidoService);
  });

  describe('create', () => {
    it('generates unique slug when base is free', async () => {
      listaRepo.findOne.mockResolvedValue(null);
      listaRepo.create.mockImplementation((data) => data as never);
      listaRepo.save.mockImplementation(
        async (l) => ({ id: 1, ...l }) as never,
      );

      const result = await service.create(7, { nombre: 'Mis Favoritos 2026' });

      expect(listaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: 7,
          nombre: 'Mis Favoritos 2026',
          slug: 'mis-favoritos-2026-7',
          publica: true,
        }),
      );
      expect(result).toMatchObject({ id: 1 });
    });

    it('increments slug suffix on collision', async () => {
      listaRepo.findOne
        .mockResolvedValueOnce({ id: 1 } as never) // base-7 exists
        .mockResolvedValueOnce(null); // base-7-1 is free
      listaRepo.create.mockImplementation((data) => data as never);
      listaRepo.save.mockImplementation(async (l) => l as never);

      await service.create(7, { nombre: 'Top' });

      expect(listaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'top-7-1' }),
      );
    });

    it('uses publica=false when explicitly set', async () => {
      listaRepo.findOne.mockResolvedValue(null);
      listaRepo.create.mockImplementation((data) => data as never);
      listaRepo.save.mockImplementation(async (l) => l as never);

      await service.create(5, { nombre: 'Priv', publica: false });

      expect(listaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ publica: false }),
      );
    });
  });

  describe('update', () => {
    it('throws ForbiddenException when user is not owner', async () => {
      listaRepo.findOne.mockResolvedValue({ id: 1, usuario_id: 99 } as never);
      await expect(service.update(1, 7, { nombre: 'x' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when lista missing', async () => {
      listaRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, 7, { nombre: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('merges changes and saves', async () => {
      const lista = { id: 1, usuario_id: 7, nombre: 'Old', publica: true };
      listaRepo.findOne.mockResolvedValue(lista as never);
      listaRepo.save.mockImplementation(async (l) => l as never);

      const result = await service.update(1, 7, {
        nombre: 'New',
        publica: false,
      });
      expect(result).toMatchObject({ nombre: 'New', publica: false });
    });
  });

  describe('addItem', () => {
    it('rejects when user is not owner', async () => {
      listaRepo.findOne.mockResolvedValue({ id: 1, usuario_id: 99 } as never);
      await expect(
        service.addItem(1, 7, { jikan_id: 10, titulo: 't', tipo: 'ANIME' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('adds new item with next orden', async () => {
      listaRepo.findOne.mockResolvedValue({ id: 1, usuario_id: 7 } as never);
      contenidoService.findOrCreateByJikanId.mockResolvedValue({
        id: 42,
      } as never);
      itemRepo.findOne.mockResolvedValue(null);
      const qb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 4 }),
      };
      itemRepo.createQueryBuilder.mockReturnValue(qb as never);
      itemRepo.create.mockImplementation((d) => d as never);
      itemRepo.save.mockImplementation(async (i) => ({ id: 1, ...i }) as never);
      listaRepo.update.mockResolvedValue({ affected: 1 } as never);

      const result = await service.addItem(1, 7, {
        jikan_id: 10,
        titulo: 't',
        tipo: 'ANIME',
      });

      expect(itemRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ orden: 5 }),
      );
      expect(listaRepo.update).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 1 });
    });

    it('is idempotent: returns existing item if already added', async () => {
      listaRepo.findOne.mockResolvedValue({ id: 1, usuario_id: 7 } as never);
      contenidoService.findOrCreateByJikanId.mockResolvedValue({
        id: 42,
      } as never);
      const existing = { id: 3, nota: undefined };
      itemRepo.findOne.mockResolvedValue(existing as never);

      const result = await service.addItem(1, 7, {
        jikan_id: 10,
        titulo: 't',
        tipo: 'ANIME',
      });

      expect(result).toBe(existing);
      expect(itemRepo.create).not.toHaveBeenCalled();
    });

    it('updates nota on existing item when provided', async () => {
      listaRepo.findOne.mockResolvedValue({ id: 1, usuario_id: 7 } as never);
      contenidoService.findOrCreateByJikanId.mockResolvedValue({
        id: 42,
      } as never);
      const existing = { id: 3, nota: 'old' };
      itemRepo.findOne.mockResolvedValue(existing as never);

      await service.addItem(1, 7, {
        jikan_id: 10,
        titulo: 't',
        tipo: 'ANIME',
        nota: 'new',
      });

      expect(existing.nota).toBe('new');
      expect(itemRepo.save).toHaveBeenCalledWith(existing);
    });
  });

  describe('findById', () => {
    it('throws ForbiddenException when viewing private list of another user', async () => {
      listaRepo.findOne.mockResolvedValue({
        id: 1,
        usuario_id: 7,
        publica: false,
        usuario: { id: 7 },
      } as never);
      await expect(service.findById(1, 99)).rejects.toThrow(ForbiddenException);
    });

    it('allows owner to view their private list', async () => {
      listaRepo.findOne.mockResolvedValue({
        id: 1,
        usuario_id: 7,
        publica: false,
        usuario: { id: 7, nombre: 'Owner' },
        nombre: 'Priv',
      } as never);
      itemRepo.find.mockResolvedValue([]);

      const result = await service.findById(1, 7);
      expect(result.isOwner).toBe(true);
      expect(result.items).toEqual([]);
    });
  });
});
