import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecomendacionesService } from './recomendaciones.service';
import { Rating, Favorito, ListaItem, Contenido } from '../database/entities';
import { CacheService } from '../cache/cache.service';
import type { ObjectLiteral } from 'typeorm';

type MockRepo<T extends ObjectLiteral> = jest.Mocked<Repository<T>>;

function makeQbMock(getMany: unknown[] = [], getRawMany: unknown[] = []) {
  const qb = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(getRawMany),
    getMany: jest.fn().mockResolvedValue(getMany),
  };
  return qb;
}

describe('RecomendacionesService', () => {
  let service: RecomendacionesService;
  let ratingRepo: MockRepo<Rating>;
  let favRepo: MockRepo<Favorito>;
  let listaRepo: MockRepo<ListaItem>;
  let contenidoRepo: MockRepo<Contenido>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecomendacionesService,
        {
          provide: getRepositoryToken(Rating),
          useValue: { find: jest.fn(), createQueryBuilder: jest.fn() },
        },
        {
          provide: getRepositoryToken(Favorito),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(ListaItem),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Contenido),
          useValue: { find: jest.fn(), createQueryBuilder: jest.fn() },
        },
        {
          provide: CacheService,
          useValue: (() => {
            const store = new Map<string, unknown>();
            return {
              get: jest.fn(async (key: string) => store.get(key) ?? null),
              set: jest.fn(async (key: string, value: unknown) => {
                store.set(key, value);
              }),
              del: jest.fn(async (key: string) => {
                store.delete(key);
              }),
              wrap: jest.fn(),
            };
          })(),
        },
      ],
    }).compile();

    service = module.get(RecomendacionesService);
    ratingRepo = module.get(getRepositoryToken(Rating));
    favRepo = module.get(getRepositoryToken(Favorito));
    listaRepo = module.get(getRepositoryToken(ListaItem));
    contenidoRepo = module.get(getRepositoryToken(Contenido));
  });

  describe('getForUser cold start', () => {
    it('returns content-based with cold strategy when user has 0 ratings', async () => {
      ratingRepo.find.mockResolvedValueOnce([]); // userRatings
      favRepo.find.mockResolvedValueOnce([]);
      listaRepo.find.mockResolvedValueOnce([]);
      ratingRepo.find.mockResolvedValueOnce([]); // ratings inside seenIds (already mocked above)
      ratingRepo.find.mockResolvedValueOnce([]); // userRatings inside contentBased

      const fallbackQb = makeQbMock([
        {
          id: 1,
          jikan_id: 100,
          titulo: 'X',
          tipo: 'ANIME',
          generos: [],
        } as unknown as Contenido,
      ]);
      contenidoRepo.createQueryBuilder.mockReturnValue(fallbackQb as never);

      const statsQb = makeQbMock([], []);
      ratingRepo.createQueryBuilder.mockReturnValue(statsQb as never);

      const result = await service.getForUser(1, 5);
      expect(result.strategy).toBe('cold');
    });
  });

  describe('getForUser content-based', () => {
    it('returns content strategy when user has 1-2 high ratings', async () => {
      const userRatings = [
        { usuario_id: 1, contenido_id: 10, puntuacion: 8 } as Rating,
      ];
      ratingRepo.find
        .mockResolvedValueOnce(userRatings) // initial userRatings
        .mockResolvedValueOnce(userRatings) // seenIds.ratings
        .mockResolvedValueOnce([
          // contentBased userRatings (with relations)
          {
            ...userRatings[0],
            contenido: { generos: [{ id: 5, nombre: 'Action' }] },
          } as never,
        ]);
      favRepo.find.mockResolvedValueOnce([]);
      listaRepo.find.mockResolvedValueOnce([]);

      const idsQb = makeQbMock([], [{ id: 20 }, { id: 21 }]);
      contenidoRepo.createQueryBuilder.mockReturnValue(idsQb as never);
      contenidoRepo.find.mockResolvedValueOnce([
        {
          id: 20,
          jikan_id: 200,
          titulo: 'A',
          tipo: 'ANIME',
          generos: [],
        } as never,
        {
          id: 21,
          jikan_id: 201,
          titulo: 'B',
          tipo: 'ANIME',
          generos: [],
        } as never,
      ]);

      const statsQb = makeQbMock([], []);
      ratingRepo.createQueryBuilder.mockReturnValue(statsQb as never);

      const result = await service.getForUser(1, 5);
      expect(result.strategy).toBe('content');
      expect(result.items.length).toBeGreaterThan(0);
    });
  });

  describe('cache', () => {
    it('returns cached items on second call within TTL', async () => {
      ratingRepo.find.mockResolvedValue([]);
      favRepo.find.mockResolvedValue([]);
      listaRepo.find.mockResolvedValue([]);
      const fallbackQb = makeQbMock([]);
      contenidoRepo.createQueryBuilder.mockReturnValue(fallbackQb as never);
      const statsQb = makeQbMock([], []);
      ratingRepo.createQueryBuilder.mockReturnValue(statsQb as never);

      await service.getForUser(99, 5);
      const callsBefore = ratingRepo.find.mock.calls.length;
      await service.getForUser(99, 5);
      expect(ratingRepo.find.mock.calls.length).toBe(callsBefore);
    });

    it('invalidate clears cache for user', async () => {
      ratingRepo.find.mockResolvedValue([]);
      favRepo.find.mockResolvedValue([]);
      listaRepo.find.mockResolvedValue([]);
      const fallbackQb = makeQbMock([]);
      contenidoRepo.createQueryBuilder.mockReturnValue(fallbackQb as never);
      const statsQb = makeQbMock([], []);
      ratingRepo.createQueryBuilder.mockReturnValue(statsQb as never);

      await service.getForUser(50, 5);
      service.invalidate(50);
      const callsBefore = ratingRepo.find.mock.calls.length;
      await service.getForUser(50, 5);
      expect(ratingRepo.find.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  describe('getForUser CF', () => {
    it('uses cf strategy when user has >= 3 high ratings', async () => {
      const userRatings = [
        { usuario_id: 1, contenido_id: 10, puntuacion: 9 } as Rating,
        { usuario_id: 1, contenido_id: 11, puntuacion: 8 } as Rating,
        { usuario_id: 1, contenido_id: 12, puntuacion: 8 } as Rating,
      ];
      ratingRepo.find
        .mockResolvedValueOnce(userRatings)
        .mockResolvedValueOnce(userRatings) // seenIds.ratings
        .mockResolvedValueOnce(userRatings); // contentBased fallback if needed
      favRepo.find.mockResolvedValueOnce([]);
      listaRepo.find.mockResolvedValueOnce([]);

      const neighborQb = makeQbMock([], [{ usuario_id: 2, overlap: '2' }]);
      const neighborRatingsQb = makeQbMock([
        { usuario_id: 2, contenido_id: 10, puntuacion: 9 } as Rating,
        { usuario_id: 2, contenido_id: 11, puntuacion: 8 } as Rating,
        { usuario_id: 2, contenido_id: 50, puntuacion: 9 } as Rating,
        { usuario_id: 2, contenido_id: 51, puntuacion: 9 } as Rating,
      ]);
      const statsQb = makeQbMock([], []);
      ratingRepo.createQueryBuilder
        .mockReturnValueOnce(neighborQb as never)
        .mockReturnValueOnce(neighborRatingsQb as never)
        .mockReturnValue(statsQb as never);

      contenidoRepo.find.mockImplementation(async (opts) => {
        const where = (opts as { where?: unknown })?.where;
        if (!where) return [] as never;
        return [
          { id: 50, jikan_id: 500, titulo: 'C', tipo: 'ANIME', generos: [] },
          { id: 51, jikan_id: 501, titulo: 'D', tipo: 'ANIME', generos: [] },
          { id: 10, jikan_id: 100, titulo: 'Source', tipo: 'ANIME' },
        ] as never;
      });

      const result = await service.getForUser(1, 3);
      expect(result.strategy).toBe('cf');
      expect(result.items.length).toBeGreaterThan(0);
    });
  });
});
