import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

const ANILIST_URL = 'https://graphql.anilist.co';
const TTL = 24 * 3600;

export interface CoverArtResult {
  jikan_id: number;
  tipo: 'anime' | 'manga';
  /** Retrato grande (ideal para manga / fallback anime). */
  poster: string | null;
  /** Banner panorámico cuando existe (mejor para hero horizontal). */
  banner: string | null;
  source: 'anilist' | 'none';
}

@Injectable()
export class CoverArtService {
  private readonly logger = new Logger(CoverArtService.name);

  constructor(private readonly cache: CacheService) {}

  async getCoverArt(jikanId: number, tipo: 'anime' | 'manga'): Promise<CoverArtResult> {
    const key = `cover-art:${tipo}:${jikanId}`;
    const cached = await this.cache.get<CoverArtResult>(key);
    if (cached) return cached;

    const fresh = await this.fetchFromAnilist(jikanId, tipo);
    await this.cache.set(key, fresh, TTL);
    return fresh;
  }

  private async fetchFromAnilist(idMal: number, tipo: 'anime' | 'manga'): Promise<CoverArtResult> {
    const empty = (): CoverArtResult => ({
      jikan_id: idMal,
      tipo,
      poster: null,
      banner: null,
      source: 'none',
    });

    const query = `query ($idMal: Int, $type: MediaType) {
      Media(idMal: $idMal, type: $type) {
        bannerImage
        coverImage { extraLarge large medium }
      }
    }`;

    try {
      const res = await fetch(ANILIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { idMal, type: tipo === 'anime' ? 'ANIME' : 'MANGA' },
        }),
      });
      if (!res.ok) return empty();

      const json = (await res.json()) as {
        data?: {
          Media?: {
            bannerImage?: string | null;
            coverImage?: {
              extraLarge?: string | null;
              large?: string | null;
              medium?: string | null;
            } | null;
          } | null;
        };
      };

      const m = json.data?.Media;
      if (!m) return empty();

      const poster =
        m.coverImage?.extraLarge ??
        m.coverImage?.large ??
        m.coverImage?.medium ??
        null;

      const banner =
        typeof m.bannerImage === 'string' && m.bannerImage.trim().length > 0
          ? m.bannerImage.trim()
          : null;

      const hasAny = Boolean(poster || banner);
      return {
        jikan_id: idMal,
        tipo,
        poster,
        banner,
        source: hasAny ? 'anilist' : 'none',
      };
    } catch (err) {
      this.logger.warn(`AniList cover-art error: ${(err as Error).message}`);
      return empty();
    }
  }
}
