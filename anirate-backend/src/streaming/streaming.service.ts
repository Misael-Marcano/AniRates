import { Injectable, Logger } from '@nestjs/common';
import {
  STREAMING_MAP,
  justWatchSearch,
  crunchyrollSearch,
  type StreamingEntry,
} from './providers.data';
import { CacheService } from '../cache/cache.service';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_TTL = 7 * 24 * 3600;

interface TmdbSearchResult {
  results: {
    id: number;
    name?: string;
    title?: string;
    first_air_date?: string;
    release_date?: string;
  }[];
}

interface TmdbWatchProviders {
  results: Record<
    string,
    {
      flatrate?: { provider_name: string }[];
      free?: { provider_name: string }[];
      rent?: { provider_name: string }[];
      buy?: { provider_name: string }[];
    }
  >;
}

const PROVIDER_URL_MAP: Record<string, string> = {
  Crunchyroll: 'https://www.crunchyroll.com/search?q={title}',
  Netflix: 'https://www.netflix.com/search?q={title}',
  Hulu: 'https://www.hulu.com/search?q={title}',
  HIDIVE: 'https://www.hidive.com/search?q={title}',
  'Disney Plus': 'https://www.disneyplus.com/search?q={title}',
  'Amazon Prime Video': 'https://www.amazon.com/s?k={title}&i=instant-video',
  YouTube: 'https://www.youtube.com/results?search_query={title}',
};

export interface WatchResponse {
  jikan_id: number;
  curated: StreamingEntry[];
  tmdb?: { provider: string; type: string; url: string }[];
  search: { provider: string; url: string }[];
}

@Injectable()
export class StreamingService {
  private readonly logger = new Logger(StreamingService.name);

  constructor(private readonly cache: CacheService) {}

  async getProviders(
    jikanId: number,
    title: string,
    tipo: 'anime' | 'manga' = 'anime',
  ): Promise<WatchResponse> {
    const curated = STREAMING_MAP[jikanId] ?? [];
    const tmdb =
      curated.length === 0 && tipo === 'anime' && title
        ? await this.fetchTmdb(jikanId, title)
        : undefined;

    return {
      jikan_id: jikanId,
      curated,
      tmdb,
      search: [
        { provider: 'justwatch', url: justWatchSearch(title) },
        { provider: 'crunchyroll', url: crunchyrollSearch(title) },
      ],
    };
  }

  private async fetchTmdb(
    jikanId: number,
    title: string,
  ): Promise<{ provider: string; type: string; url: string }[] | undefined> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return undefined;

    const key = `tmdb:watch:${jikanId}`;
    const cached =
      await this.cache.get<{ provider: string; type: string; url: string }[]>(
        key,
      );
    if (cached) return cached;

    try {
      const searchRes = await fetch(
        `${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=en-US`,
      );
      if (!searchRes.ok) return undefined;
      const search = (await searchRes.json()) as TmdbSearchResult;
      const tmdbId = search.results[0]?.id;
      if (!tmdbId) {
        await this.cache.set(key, [], TMDB_TTL);
        return [];
      }

      const providersRes = await fetch(
        `${TMDB_BASE}/tv/${tmdbId}/watch/providers?api_key=${apiKey}`,
      );
      if (!providersRes.ok) return undefined;
      const data = (await providersRes.json()) as TmdbWatchProviders;
      const us = data.results['US'] ?? data.results['MX'] ?? data.results['ES'];
      if (!us) {
        await this.cache.set(key, [], TMDB_TTL);
        return [];
      }

      const out: { provider: string; type: string; url: string }[] = [];
      const buildUrl = (name: string) =>
        (PROVIDER_URL_MAP[name] ?? '').replace(
          '{title}',
          encodeURIComponent(title),
        );

      for (const p of us.flatrate ?? [])
        out.push({
          provider: p.provider_name,
          type: 'subscription',
          url: buildUrl(p.provider_name),
        });
      for (const p of us.free ?? [])
        out.push({
          provider: p.provider_name,
          type: 'free',
          url: buildUrl(p.provider_name),
        });
      for (const p of us.rent ?? [])
        out.push({
          provider: p.provider_name,
          type: 'rent',
          url: buildUrl(p.provider_name),
        });

      const filtered = out.filter((e) => e.url);
      await this.cache.set(key, filtered, TMDB_TTL);
      return filtered;
    } catch (err) {
      this.logger.warn(`TMDB fetch error: ${(err as Error).message}`);
      return undefined;
    }
  }

  byProvider(provider: string): { jikan_ids: number[] } {
    const ids: number[] = [];
    for (const [jikanIdStr, entries] of Object.entries(STREAMING_MAP)) {
      if (entries.some((e) => e.provider === provider))
        ids.push(Number(jikanIdStr));
    }
    return { jikan_ids: ids };
  }

  listProviders(): { providers: string[] } {
    const set = new Set<string>();
    for (const entries of Object.values(STREAMING_MAP)) {
      for (const e of entries) set.add(e.provider);
    }
    return { providers: Array.from(set).sort() };
  }
}
