import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

const ANILIST_URL = 'https://graphql.anilist.co';
const JIKAN_BASE = 'https://api.jikan.moe/v4';
const TTL = 24 * 3600;

export type Lang = 'en' | 'es' | 'pt-BR' | 'ja';

export interface SynopsisResult {
  jikan_id: number;
  lang: Lang;
  source: 'anilist' | 'jikan' | 'fallback';
  text: string;
  available_langs: Lang[];
}

@Injectable()
export class SynopsisService {
  private readonly logger = new Logger(SynopsisService.name);

  constructor(private readonly cache: CacheService) {}

  async getSynopsis(
    jikanId: number,
    lang: Lang,
    tipo: 'anime' | 'manga' = 'anime',
  ): Promise<SynopsisResult> {
    const key = `synopsis:${tipo}:${jikanId}:${lang}`;
    const cached = await this.cache.get<SynopsisResult>(key);
    if (cached) return cached;

    const result = await this.fetchSynopsis(jikanId, lang, tipo);
    await this.cache.set(key, result, TTL);
    return result;
  }

  private async fetchSynopsis(
    jikanId: number,
    lang: Lang,
    tipo: 'anime' | 'manga',
  ): Promise<SynopsisResult> {
    const translateAvailable = Boolean(process.env.LIBRETRANSLATE_URL);
    const available: Lang[] = translateAvailable
      ? ['en', 'ja', 'es', 'pt-BR']
      : ['en', 'ja'];

    const anilistText = await this.fetchAnilist(jikanId, tipo);
    const jikanText = await this.fetchJikan(jikanId, tipo);
    const sourceText = anilistText ? this.stripHtml(anilistText) : jikanText;
    const sourceProvider: 'anilist' | 'jikan' | 'fallback' = anilistText
      ? 'anilist'
      : jikanText
        ? 'jikan'
        : 'fallback';

    if (!sourceText) {
      return {
        jikan_id: jikanId,
        lang,
        source: 'fallback',
        text: '',
        available_langs: [],
      };
    }

    if (lang === 'en' || lang === 'ja') {
      return {
        jikan_id: jikanId,
        lang,
        source: sourceProvider,
        text: sourceText,
        available_langs: available,
      };
    }

    if (translateAvailable) {
      const translated = await this.translate(sourceText, lang);
      if (translated) {
        return {
          jikan_id: jikanId,
          lang,
          source: sourceProvider,
          text: translated,
          available_langs: available,
        };
      }
    }

    return {
      jikan_id: jikanId,
      lang: 'en',
      source: sourceProvider,
      text: sourceText,
      available_langs: available,
    };
  }

  private async translate(text: string, target: Lang): Promise<string | null> {
    const url = process.env.LIBRETRANSLATE_URL;
    if (!url) return null;
    const targetCode = target === 'pt-BR' ? 'pt' : target;
    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text.slice(0, 4500),
          source: 'en',
          target: targetCode,
          format: 'text',
          api_key: process.env.LIBRETRANSLATE_API_KEY ?? '',
        }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { translatedText?: string };
      return data.translatedText ?? null;
    } catch (err) {
      this.logger.warn(`LibreTranslate error: ${(err as Error).message}`);
      return null;
    }
  }

  private async fetchAnilist(
    idMal: number,
    tipo: 'anime' | 'manga',
  ): Promise<string | null> {
    const query = `query ($idMal: Int, $type: MediaType) {
      Media(idMal: $idMal, type: $type) { description(asHtml: false) }
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
      if (!res.ok) return null;
      const json = (await res.json()) as {
        data?: { Media?: { description?: string | null } };
      };
      return json.data?.Media?.description ?? null;
    } catch (err) {
      this.logger.warn(`AniList fetch error: ${(err as Error).message}`);
      return null;
    }
  }

  private async fetchJikan(
    jikanId: number,
    tipo: 'anime' | 'manga',
  ): Promise<string | null> {
    try {
      const res = await fetch(`${JIKAN_BASE}/${tipo}/${jikanId}`);
      if (!res.ok) return null;
      const json = (await res.json()) as {
        data?: { synopsis?: string | null };
      };
      return json.data?.synopsis ?? null;
    } catch {
      return null;
    }
  }

  private stripHtml(text: string): string {
    return text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
