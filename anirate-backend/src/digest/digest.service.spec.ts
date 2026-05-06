import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigestService } from './digest.service';
import { Usuario, Seguimiento, Review } from '../database/entities';
import { MailService } from '../mail/mail.service';
import { RecomendacionesService } from '../recomendaciones/recomendaciones.service';

describe('DigestService', () => {
  let service: DigestService;
  let mailService: jest.Mocked<Pick<MailService, 'sendWeeklyDigest'>>;
  let recoService: jest.Mocked<
    Pick<RecomendacionesService, 'getForUser'>
  >;
  let userRepo: jest.Mocked<Pick<Repository<Usuario>, 'find'>>;
  let segRepo: jest.Mocked<Pick<Repository<Seguimiento>, 'find' | 'count'>>;
  let reviewRepo: jest.Mocked<Pick<Repository<Review>, 'createQueryBuilder'>>;

  beforeEach(async () => {
    mailService = { sendWeeklyDigest: jest.fn().mockResolvedValue({}) };
    recoService = { getForUser: jest.fn() };

    userRepo = { find: jest.fn() };
    segRepo = { find: jest.fn(), count: jest.fn().mockResolvedValue(0) };
    reviewRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigestService,
        { provide: MailService, useValue: mailService },
        { provide: RecomendacionesService, useValue: recoService },
        { provide: getRepositoryToken(Usuario), useValue: userRepo },
        { provide: getRepositoryToken(Seguimiento), useValue: segRepo },
        { provide: getRepositoryToken(Review), useValue: reviewRepo },
      ],
    }).compile();

    service = module.get(DigestService);
  });

  function mockDigestQueries(topReviewsRows: Review[]) {
    const qbTop = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(topReviewsRows),
    };
    const qbPulse = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    };
    reviewRepo.createQueryBuilder
      .mockReturnValueOnce(qbTop as never)
      .mockReturnValueOnce(qbPulse as never);
  }

  it('sends digest when only personalized recommendations exist', async () => {
    userRepo.find.mockResolvedValue([
      {
        id: 1,
        email: 'a@test.local',
        nombre: 'Ada',
        notification_prefs: { email_weekly_digest: true },
        shadowbanned: false,
        banned: false,
      } as Usuario,
    ]);
    segRepo.find.mockResolvedValue([]);
    recoService.getForUser.mockResolvedValue({
      items: [
        {
          contenido_id: 10,
          jikan_id: 99,
          titulo: 'Nice Anime',
          imagen: null,
          tipo: 'ANIME',
          año: 2024,
          score: 8,
          rating_promedio: 8,
          total_ratings: 1,
          source_jikan_id: null,
          source_titulo: null,
        },
      ],
      strategy: 'cold',
    });

    mockDigestQueries([]);

    await service.runWeeklyDigestJob();

    expect(mailService.sendWeeklyDigest).toHaveBeenCalledWith(
      'a@test.local',
      expect.objectContaining({
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            titulo: 'Nice Anime',
            url: expect.stringContaining('/contenido/anime/99'),
          }),
        ]),
      }),
    );
  });

  it('skips subscriber when activity and recommendations are empty', async () => {
    userRepo.find.mockResolvedValue([
      {
        id: 2,
        email: 'b@test.local',
        nombre: 'Bob',
        notification_prefs: { email_weekly_digest: true },
        shadowbanned: false,
        banned: false,
      } as Usuario,
    ]);
    segRepo.find.mockResolvedValue([]);
    recoService.getForUser.mockResolvedValue({ items: [], strategy: 'cold' });

    mockDigestQueries([]);

    const res = await service.runWeeklyDigestJob();

    expect(res.skipped).toBe(1);
    expect(res.sent).toBe(0);
    expect(mailService.sendWeeklyDigest).not.toHaveBeenCalled();
  });
});
