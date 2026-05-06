import { Repository } from 'typeorm';
import { Contenido, Review, ReviewRespuesta } from '../database/entities';

export function trimFrontendBase(frontendUrl: string | undefined): string {
  const b =
    (frontendUrl ?? 'http://localhost:5000').replace(/\/$/, '') ||
    'http://localhost:5000';
  return b;
}

function contenidoSegment(tipo: string | undefined): 'anime' | 'manga' {
  return tipo === 'MANGA' ? 'manga' : 'anime';
}

export async function resolveNotificationPushUrl(
  tipo: string,
  referencia_id: number | null | undefined,
  base: string,
  repos: {
    contenidoRepo: Pick<Repository<Contenido>, 'findOne'>;
    reviewRepo: Pick<Repository<Review>, 'findOne'>;
    respuestaRepo: Pick<Repository<ReviewRespuesta>, 'findOne'>;
  },
): Promise<string> {
  const home = `${base}/`;
  if (referencia_id == null) return home;

  switch (tipo) {
    case 'nuevo_episodio':
    case 'lista_inicio': {
      const c = await repos.contenidoRepo.findOne({
        where: { id: referencia_id },
        select: ['id', 'jikan_id', 'tipo'],
      });
      if (!c?.jikan_id) return home;
      const seg = contenidoSegment(c.tipo);
      return `${base}/contenido/${seg}/${c.jikan_id}`;
    }
    case 'mencion_review':
    case 'voto_review': {
      const r = await repos.reviewRepo.findOne({
        where: { id: referencia_id },
        relations: ['contenido'],
      });
      const jikan = r?.contenido?.jikan_id;
      if (!r || jikan == null) return home;
      const seg = contenidoSegment(r.contenido.tipo);
      return `${base}/contenido/${seg}/${jikan}#review-${r.id}`;
    }
    case 'mencion_respuesta': {
      const reply = await repos.respuestaRepo.findOne({
        where: { id: referencia_id },
        relations: ['review', 'review.contenido'],
      });
      const cont = reply?.review?.contenido;
      const jikan = cont?.jikan_id;
      const reviewId = reply?.review_id;
      if (!reply || !cont || jikan == null || reviewId == null) return home;
      const seg = contenidoSegment(cont.tipo);
      return `${base}/contenido/${seg}/${jikan}#review-${reviewId}`;
    }
    default:
      return home;
  }
}
