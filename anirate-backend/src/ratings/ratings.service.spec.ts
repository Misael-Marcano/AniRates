import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RatingsService } from './ratings.service';
import { ContenidoService } from '../contenido/contenido.service';
import { Rating } from '../database/entities';

describe('RatingsService', () => {
  let service: RatingsService;
  let ratingRepo: jest.Mocked<Repository<Rating>>;
  let contenidoService: jest.Mocked<ContenidoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: getRepositoryToken(Rating),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: ContenidoService,
          useValue: {
            findOrCreateByJikanId: jest.fn(),
            findByJikanId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RatingsService);
    ratingRepo = module.get(getRepositoryToken(Rating));
    contenidoService = module.get(ContenidoService);
  });

  describe('getDistribution', () => {
    it('returns 10 buckets with counts per score', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { puntuacion: 8, count: '5' },
          { puntuacion: 10, count: '3' },
          { puntuacion: 1, count: '1' },
        ]),
      };
      ratingRepo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.getDistribution(1);

      expect(result).toHaveLength(10);
      expect(result[0]).toBe(1); // score 1
      expect(result[7]).toBe(5); // score 8
      expect(result[9]).toBe(3); // score 10
      expect(result[4]).toBe(0); // score 5, not present
    });

    it('returns zeroed buckets when no ratings', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      ratingRepo.createQueryBuilder.mockReturnValue(qb as never);
      const result = await service.getDistribution(1);
      expect(result).toEqual(new Array(10).fill(0));
    });
  });

  describe('getDistributionByJikanId', () => {
    it('returns zeroed buckets when contenido not found', async () => {
      contenidoService.findByJikanId.mockResolvedValue(null);
      const result = await service.getDistributionByJikanId(999);
      expect(result).toEqual(new Array(10).fill(0));
    });
  });

  describe('rate', () => {
    it('creates a new rating when none exists', async () => {
      contenidoService.findOrCreateByJikanId.mockResolvedValue({
        id: 42,
      } as never);
      ratingRepo.findOne.mockResolvedValue(null);
      const created = { id: 1, contenido_id: 42, usuario_id: 7, puntuacion: 8 };
      ratingRepo.create.mockReturnValue(created as never);
      ratingRepo.save.mockResolvedValue(created as never);

      const result = await service.rate(
        { jikan_id: 10, titulo: 't', tipo: 'ANIME', puntuacion: 8 } as never,
        7,
      );

      expect(ratingRepo.create).toHaveBeenCalledWith({
        contenido_id: 42,
        puntuacion: 8,
        usuario_id: 7,
      });
      expect(result).toBe(created);
    });

    it('updates existing rating instead of creating a duplicate', async () => {
      contenidoService.findOrCreateByJikanId.mockResolvedValue({
        id: 42,
      } as never);
      const existing = {
        id: 3,
        contenido_id: 42,
        usuario_id: 7,
        puntuacion: 5,
      };
      ratingRepo.findOne.mockResolvedValue(existing as never);
      ratingRepo.save.mockImplementation(async (r) => r as never);

      const result = await service.rate(
        { jikan_id: 10, titulo: 't', tipo: 'ANIME', puntuacion: 9 } as never,
        7,
      );

      expect(ratingRepo.create).not.toHaveBeenCalled();
      expect((result as { puntuacion: number }).puntuacion).toBe(9);
    });
  });
});
