import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatsService } from './stats.service';
import { Contenido, Rating, Review, Usuario } from '../database/entities';

describe('StatsService', () => {
  let service: StatsService;
  let contenidoRepo: jest.Mocked<Repository<Contenido>>;
  let ratingRepo: jest.Mocked<Repository<Rating>>;
  let reviewRepo: jest.Mocked<Repository<Review>>;
  let usuarioRepo: jest.Mocked<Repository<Usuario>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: getRepositoryToken(Contenido),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Rating),
          useValue: { count: jest.fn(), createQueryBuilder: jest.fn() },
        },
        {
          provide: getRepositoryToken(Review),
          useValue: { count: jest.fn(), createQueryBuilder: jest.fn() },
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: { count: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(StatsService);
    contenidoRepo = module.get(getRepositoryToken(Contenido));
    ratingRepo = module.get(getRepositoryToken(Rating));
    reviewRepo = module.get(getRepositoryToken(Review));
    usuarioRepo = module.get(getRepositoryToken(Usuario));
  });

  describe('getGlobal', () => {
    it('returns counts from all repos in parallel', async () => {
      contenidoRepo.count.mockResolvedValue(100);
      ratingRepo.count.mockResolvedValue(500);
      reviewRepo.count.mockResolvedValue(50);
      usuarioRepo.count.mockResolvedValue(25);

      const result = await service.getGlobal();

      expect(result).toEqual({
        totalContenido: 100,
        totalRatings: 500,
        totalReviews: 50,
        totalUsuarios: 25,
      });
    });
  });

  describe('getGeneroStats', () => {
    function makeAggQb(
      rows: { contenido_id: number; avg_score: number; total: number }[],
    ) {
      return {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(rows),
      };
    }

    it('aggregates frequency and average rating per genero', async () => {
      ratingRepo.createQueryBuilder.mockReturnValue(
        makeAggQb([
          { contenido_id: 1, avg_score: 8, total: 5 },
          { contenido_id: 2, avg_score: 7, total: 3 },
          { contenido_id: 3, avg_score: 9, total: 4 },
        ]) as never,
      );
      contenidoRepo.find.mockResolvedValue([
        { id: 1, generos: [{ nombre: 'Action' }, { nombre: 'Drama' }] },
        { id: 2, generos: [{ nombre: 'Action' }] },
        { id: 3, generos: [{ nombre: 'Drama' }] },
      ] as never);

      const result = await service.getGeneroStats();

      expect(result[0].nombre).toBe('Action');
      expect(result[0].count).toBe(2);
      expect(result[0].avgRating).toBeCloseTo(7.5);
      expect(result[1].nombre).toBe('Drama');
      expect(result[1].count).toBe(2);
      expect(result[1].avgRating).toBeCloseTo(8.5);
    });

    it('returns empty array when no ratings', async () => {
      ratingRepo.createQueryBuilder.mockReturnValue(makeAggQb([]) as never);
      const result = await service.getGeneroStats();
      expect(result).toEqual([]);
    });
  });
});
