import { resolveNotificationPushUrl, trimFrontendBase } from './notification-push-url';
import { Contenido, Review, ReviewRespuesta } from '../database/entities';

describe('trimFrontendBase', () => {
  it('strips trailing slash', () => {
    expect(trimFrontendBase('https://app.example/')).toBe('https://app.example');
  });
});

describe('resolveNotificationPushUrl', () => {
  const base = 'https://app.example';

  it('returns home when referencia_id is null', async () => {
    const url = await resolveNotificationPushUrl('voto_review', null, base, {
      contenidoRepo: { findOne: jest.fn() },
      reviewRepo: { findOne: jest.fn() },
      respuestaRepo: { findOne: jest.fn() },
    });
    expect(url).toBe(`${base}/`);
  });

  it('resolves nuevo_episodio from contenido id', async () => {
    const contenidoRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        jikan_id: 1535,
        tipo: 'ANIME',
      } as Partial<Contenido>),
    };
    const url = await resolveNotificationPushUrl(
      'nuevo_episodio',
      1,
      base,
      {
        contenidoRepo,
        reviewRepo: { findOne: jest.fn() },
        respuestaRepo: { findOne: jest.fn() },
      },
    );
    expect(url).toBe(`${base}/contenido/anime/1535`);
  });

  it('resolves lista_inicio for manga', async () => {
    const contenidoRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 2,
        jikan_id: 99,
        tipo: 'MANGA',
      } as Partial<Contenido>),
    };
    const url = await resolveNotificationPushUrl(
      'lista_inicio',
      2,
      base,
      {
        contenidoRepo,
        reviewRepo: { findOne: jest.fn() },
        respuestaRepo: { findOne: jest.fn() },
      },
    );
    expect(url).toBe(`${base}/contenido/manga/99`);
  });

  it('resolves voto_review with hash', async () => {
    const reviewRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 7,
        contenido: { jikan_id: 1, tipo: 'ANIME' },
      } as Partial<Review>),
    };
    const url = await resolveNotificationPushUrl('voto_review', 7, base, {
      contenidoRepo: { findOne: jest.fn() },
      reviewRepo,
      respuestaRepo: { findOne: jest.fn() },
    });
    expect(url).toBe(`${base}/contenido/anime/1#review-7`);
  });

  it('resolves mencion_respuesta via reply → review → contenido', async () => {
    const respuestaRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 50,
        review_id: 7,
        review: {
          contenido: { jikan_id: 2, tipo: 'MANGA' },
        },
      } as Partial<ReviewRespuesta>),
    };
    const url = await resolveNotificationPushUrl('mencion_respuesta', 50, base, {
      contenidoRepo: { findOne: jest.fn() },
      reviewRepo: { findOne: jest.fn() },
      respuestaRepo,
    });
    expect(url).toBe(`${base}/contenido/manga/2#review-7`);
  });

  it('falls back to home for unknown tipo', async () => {
    const url = await resolveNotificationPushUrl('accion', 1, base, {
      contenidoRepo: { findOne: jest.fn() },
      reviewRepo: { findOne: jest.fn() },
      respuestaRepo: { findOne: jest.fn() },
    });
    expect(url).toBe(`${base}/`);
  });
});
