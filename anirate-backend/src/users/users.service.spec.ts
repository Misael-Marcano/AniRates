import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersService } from './users.service';
import { ModeracionAuditService } from '../moderacion/moderacion-audit.service';
import {
  Usuario,
  Seguimiento,
  Favorito,
  Review,
  Rating,
  ListaItem,
  UserReport,
} from '../database/entities';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<Usuario>>;
  let follows: jest.Mocked<Repository<Seguimiento>>;
  let favs: jest.Mocked<Repository<Favorito>>;
  let reviews: jest.Mocked<Repository<Review>>;
  let ratings: jest.Mocked<Repository<Rating>>;
  let lista: jest.Mocked<Repository<ListaItem>>;

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Seguimiento),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Favorito),
          useValue: { count: jest.fn() },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: { count: jest.fn(), find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Rating),
          useValue: { count: jest.fn(), find: jest.fn() },
        },
        {
          provide: getRepositoryToken(ListaItem),
          useValue: { count: jest.fn(), find: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserReport),
          useValue: {
            exist: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: { getRepository: jest.fn(), transaction: jest.fn() },
        },
        {
          provide: ModeracionAuditService,
          useValue: {
            append: jest.fn().mockResolvedValue(undefined),
            listRecent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = mod.get(UsersService);
    userRepo = mod.get(getRepositoryToken(Usuario));
    follows = mod.get(getRepositoryToken(Seguimiento));
    favs = mod.get(getRepositoryToken(Favorito));
    reviews = mod.get(getRepositoryToken(Review));
    ratings = mod.get(getRepositoryToken(Rating));
    lista = mod.get(getRepositoryToken(ListaItem));
  });

  describe('getPublicProfile', () => {
    it('throws NotFound when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.getPublicProfile(99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns profile with isFollowing=false when viewer is self', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        nombre: 'Alice',
        shadowbanned: false,
        banned: false,
      } as never);
      favs.count.mockResolvedValue(3);
      reviews.count.mockResolvedValue(5);
      ratings.count.mockResolvedValue(10);
      lista.count.mockResolvedValue(7);
      follows.count.mockResolvedValueOnce(2).mockResolvedValueOnce(4);

      const result = await service.getPublicProfile(1, 1);

      expect(result.isSelf).toBe(true);
      expect(result.isFollowing).toBe(false);
      expect(result.stats.favoritos).toBe(3);
      expect(result.stats.seguidores).toBe(2);
      expect(result.stats.siguiendo).toBe(4);
      expect(follows.findOne).not.toHaveBeenCalled();
    });

    it('checks isFollowing when viewer is someone else', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 2,
        nombre: 'Bob',
        shadowbanned: false,
        banned: false,
      } as never);
      favs.count.mockResolvedValue(0);
      reviews.count.mockResolvedValue(0);
      ratings.count.mockResolvedValue(0);
      lista.count.mockResolvedValue(0);
      follows.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      follows.findOne.mockResolvedValue({ id: 10 } as never);

      const result = await service.getPublicProfile(2, 5);
      expect(result.isFollowing).toBe(true);
      expect(result.isSelf).toBe(false);
    });

    it('throws NotFound when user is shadowbanned and viewer is not admin/self', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 3,
        nombre: 'Spam',
        shadowbanned: true,
        banned: false,
      } as never);

      await expect(service.getPublicProfile(3, 9)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('allows admin to load shadowbanned profile', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 3,
        nombre: 'Spam',
        shadowbanned: true,
        banned: false,
      } as never);
      favs.count.mockResolvedValue(0);
      reviews.count.mockResolvedValue(0);
      ratings.count.mockResolvedValue(0);
      lista.count.mockResolvedValue(0);
      follows.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

      const result = await service.getPublicProfile(3, 99, 'admin');
      expect(result.nombre).toBe('Spam');
    });

    it('throws NotFound when user is banned and viewer is not admin/self', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 4,
        nombre: 'Banned',
        shadowbanned: false,
        banned: true,
      } as never);

      await expect(service.getPublicProfile(4, 9)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('allows admin to load banned profile', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 4,
        nombre: 'Banned',
        shadowbanned: false,
        banned: true,
      } as never);
      favs.count.mockResolvedValue(0);
      reviews.count.mockResolvedValue(0);
      ratings.count.mockResolvedValue(0);
      lista.count.mockResolvedValue(0);
      follows.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

      const result = await service.getPublicProfile(4, 99, 'admin');
      expect(result.nombre).toBe('Banned');
    });
  });

  describe('follow', () => {
    it('rejects self-follow', async () => {
      await expect(service.follow(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when target user missing', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.follow(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('returns existing follow without creating a duplicate', async () => {
      userRepo.findOne.mockResolvedValue({ id: 2 } as never);
      const existing = { id: 42, seguidor_id: 1, seguido_id: 2 };
      follows.findOne.mockResolvedValue(existing as never);

      const result = await service.follow(1, 2);

      expect(result).toBe(existing);
      expect(follows.create).not.toHaveBeenCalled();
      expect(follows.save).not.toHaveBeenCalled();
    });

    it('creates a new follow when none exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 2 } as never);
      follows.findOne.mockResolvedValue(null);
      const created = { id: 99, seguidor_id: 1, seguido_id: 2 };
      follows.create.mockReturnValue(created as never);
      follows.save.mockResolvedValue(created as never);

      const result = await service.follow(1, 2);
      expect(follows.create).toHaveBeenCalledWith({
        seguidor_id: 1,
        seguido_id: 2,
      });
      expect(result).toBe(created);
    });
  });

  describe('filterExistingUserIds', () => {
    it('returns empty for empty input', async () => {
      expect(await service.filterExistingUserIds([])).toEqual([]);
    });

    it('filters to ids that exist in DB', async () => {
      userRepo.find.mockResolvedValue([{ id: 3 }, { id: 9 }] as never);
      const r = await service.filterExistingUserIds([3, 5, 9, NaN]);
      expect(r.sort((a, b) => a - b)).toEqual([3, 9]);
      expect(userRepo.find).toHaveBeenCalled();
    });
  });

  describe('searchUsers', () => {
    it('returns empty array for short queries', async () => {
      const r1 = await service.searchUsers('');
      const r2 = await service.searchUsers('a');
      expect(r1).toEqual([]);
      expect(r2).toEqual([]);
      expect(userRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('uses LIKE with wildcards for valid queries', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1, nombre: 'Alice' }]),
      };
      userRepo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.searchUsers('ali');
      expect(qb.where).toHaveBeenCalledWith('u.nombre LIKE :q', { q: '%ali%' });
      expect(qb.andWhere).toHaveBeenCalledWith('u.shadowbanned = :sb', {
        sb: false,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('u.banned = :bn', {
        bn: false,
      });
      expect(result).toEqual([{ id: 1, nombre: 'Alice' }]);
    });
  });

  describe('getFeed', () => {
    it('returns empty when user follows nobody', async () => {
      follows.find.mockResolvedValue([]);
      const result = await service.getFeed(1);
      expect(result).toEqual([]);
    });

    it('merges and sorts events by date desc', async () => {
      follows.find.mockResolvedValue([
        { seguido_id: 2 },
        { seguido_id: 3 },
      ] as never);
      const older = new Date('2026-01-01T00:00:00Z');
      const newer = new Date('2026-01-05T00:00:00Z');
      reviews.find.mockResolvedValue([
        {
          fecha: older,
          usuario: { id: 2 },
          contenido: { id: 10 },
          comentario: 'old',
          puntuacion: 7,
        },
      ] as never);
      ratings.find.mockResolvedValue([
        {
          fecha: newer,
          usuario: { id: 3 },
          contenido: { id: 20 },
          puntuacion: 9,
        },
      ] as never);
      lista.find.mockResolvedValue([]);

      const result = await service.getFeed(1);

      expect(result).toHaveLength(2);
      expect(result[0].tipo).toBe('rating');
      expect(result[1].tipo).toBe('review');
    });
  });
});
