// Jikan v4 — API REST pública de MyAnimeList (sin auth)
// Docs: https://docs.api.jikan.moe/
// Opcional: `NEXT_PUBLIC_JIKAN_VIA_BACKEND=true` + `NEXT_PUBLIC_API_URL` → las peticiones pasan por el backend (caché Redis + cola única hacia Jikan).

function normalizeApiOrigin(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

const DIRECT_JIKAN_BASE = "https://api.jikan.moe/v4";
const apiPublic = typeof process.env.NEXT_PUBLIC_API_URL === "string" ? process.env.NEXT_PUBLIC_API_URL : "";
const jikanViaBackend = process.env.NEXT_PUBLIC_JIKAN_VIA_BACKEND === "true";

const BASE =
  jikanViaBackend && apiPublic.length > 0
    ? `${normalizeApiOrigin(apiPublic)}/jikan/v4`
    : DIRECT_JIKAN_BASE;

type JikanEntry = { mal_id: number; name: string };

export interface JikanAnime {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    jpg?: { large_image_url?: string; image_url?: string };
    webp?: { large_image_url?: string; image_url?: string };
  };
  year: number;
  status: string;
  score: number;
  scored_by: number;
  genres: JikanEntry[];
  // Enriched
  episodes?: number;
  studios?: JikanEntry[];
  source?: string;
  type?: string;
  rating?: string;
  season?: string;
  duration?: string;
  trailer?: { youtube_id?: string };
  themes?: JikanEntry[];
  demographics?: JikanEntry[];
  aired?: { from?: string; to?: string };
  relations?: { relation: string; entry: (JikanEntry & { type: string })[] }[];
}

export interface JikanManga {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    jpg?: { large_image_url?: string; image_url?: string };
    webp?: { large_image_url?: string; image_url?: string };
  };
  published: { from?: string; to?: string; prop: { from: { year: number } } };
  status: string;
  score: number;
  scored_by: number;
  genres: JikanEntry[];
  // Enriched
  chapters?: number;
  volumes?: number;
  authors?: { mal_id: number; name: string; type: string }[];
  type?: string;
  themes?: JikanEntry[];
  demographics?: JikanEntry[];
  relations?: { relation: string; entry: (JikanEntry & { type: string })[] }[];
}

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: { count: number; total: number; per_page: number };
}

export interface JikanPagedResult<T> {
  data: T[];
  pagination: JikanPagination;
}

export interface PagedContenido {
  items: Contenido[];
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

// MAL genre ID map — usado para filtrado
export const GENRE_MAP: Record<string, number> = {
  "Acción":       1,
  "Aventura":     2,
  "Comedia":      4,
  "Drama":        8,
  "Fantasía":     10,
  "Horror":       14,
  "Terror":       14,
  "Misterio":     7,
  "Romance":      22,
  "Sci-Fi":       24,
  "Slice of Life":36,
  "Deportes":     30,
  "Sobrenatural": 37,
  "Psicológico":  40,
  "Acción y Aventura": 1,
  "Ecchi":        9,
  "Mecha":        18,
  "Musical":      19,
  "Escolar":      23,
  "Seinen":       42,
  "Shoujo":       25,
  "Shounen":      27,
};

import type { Contenido } from "@/types";

function pickBestImage(
  images:
    | {
        jpg?: { large_image_url?: string; image_url?: string };
        webp?: { large_image_url?: string; image_url?: string };
      }
    | undefined
): string {
  return normalizeMalImageUrl(
    images?.webp?.large_image_url ??
      images?.jpg?.large_image_url ??
      images?.webp?.image_url ??
      images?.jpg?.image_url ??
      ""
  );
}

/** Posters desde listados Jikan: `image_url` suele pesar menos que `large_*` → carga antes en grids. */
function pickListPosterImage(
  images:
    | {
        jpg?: { large_image_url?: string; image_url?: string };
        webp?: { large_image_url?: string; image_url?: string };
      }
    | undefined
): string {
  return normalizeMalImageUrl(
    images?.webp?.image_url ??
      images?.jpg?.image_url ??
      images?.webp?.large_image_url ??
      images?.jpg?.large_image_url ??
      ""
  );
}

function normalizeMalImageUrl(url: string): string {
  if (!url) return "";
  // MAL/Jikan a veces devuelve variantes thumbnail /r/50x70/... que se ven muy mal en hero.
  return url.replace(/\/r\/\d+x\d+\//, "/");
}

function looksLikeThumbnail(url: string): boolean {
  return /\/r\/\d+x\d+\//.test(url);
}

/**
 * Ordena el pool del hero sin peticiones extra: descarta miniaturas MAL (`/r/NxM/`) y deduplica.
 * (Antes se medía el ancho de cada imagen en el navegador: muchas descargas y lentitud.)
 */
export function refineHeroSlidesForDisplay(slides: Contenido[], limit = 14): Contenido[] {
  const deduped = dedupeContenido(slides);
  const withUrl = deduped.filter((item) => normalizeMalImageUrl(item.imagen ?? ""));
  const noTinyThumb = withUrl.filter((item) => !looksLikeThumbnail(normalizeMalImageUrl(item.imagen ?? "")));
  const pool = noTinyThumb.length >= Math.min(6, limit) ? noTinyThumb : withUrl;
  return pool.slice(0, limit);
}

function dedupeContenido(items: Contenido[]): Contenido[] {
  const seen = new Set<string>();
  const out: Contenido[] = [];
  for (const c of items) {
    const key = `${c.tipo}-${c.jikan_id ?? c.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

function animeToContenido(a: JikanAnime, poster: "list" | "detail" = "list"): Contenido {
  const relations = a.relations?.flatMap((r) =>
    r.entry.map((e) => ({ mal_id: e.mal_id, type: e.type as "anime" | "manga", name: e.name, relation: r.relation }))
  );
  return {
    id: a.mal_id,
    jikan_id: a.mal_id,
    titulo: a.title,
    descripcion: a.synopsis ?? "",
    imagen: poster === "detail" ? pickBestImage(a.images) : pickListPosterImage(a.images),
    año: a.year ?? 0,
    estado: a.status ?? "",
    tipo: "ANIME",
    generos: a.genres?.map((g) => ({ id: g.mal_id, nombre: g.name })) ?? [],
    rating_promedio: a.score ?? 0,
    total_ratings: a.scored_by ?? 0,
    episodes: a.episodes ?? undefined,
    studios: a.studios?.map((s) => s.name) ?? [],
    source: a.source,
    media_type: a.type,
    age_rating: a.rating,
    season: a.season ? `${capitalize(a.season)} ${a.year ?? ""}`.trim() : undefined,
    duration: a.duration,
    trailer_youtube_id: a.trailer?.youtube_id ?? undefined,
    themes: a.themes?.map((t) => t.name) ?? [],
    demographics: a.demographics?.map((d) => d.name) ?? [],
    aired_from: a.aired?.from ?? undefined,
    aired_to: a.aired?.to ?? undefined,
    relations,
  };
}

function mangaToContenido(m: JikanManga, poster: "list" | "detail" = "list"): Contenido {
  const relations = m.relations?.flatMap((r) =>
    r.entry.map((e) => ({ mal_id: e.mal_id, type: e.type as "anime" | "manga", name: e.name, relation: r.relation }))
  );
  return {
    id: m.mal_id,
    jikan_id: m.mal_id,
    titulo: m.title,
    descripcion: m.synopsis ?? "",
    imagen: poster === "detail" ? pickBestImage(m.images) : pickListPosterImage(m.images),
    año: m.published?.prop?.from?.year ?? 0,
    estado: m.status ?? "",
    tipo: "MANGA",
    generos: m.genres?.map((g) => ({ id: g.mal_id, nombre: g.name })) ?? [],
    rating_promedio: m.score ?? 0,
    total_ratings: m.scored_by ?? 0,
    chapters: m.chapters ?? undefined,
    volumes: m.volumes ?? undefined,
    authors: m.authors?.filter((a) => a.type === "Story" || a.type === "Story & Art").map((a) => a.name) ?? [],
    media_type: m.type,
    themes: m.themes?.map((t) => t.name) ?? [],
    demographics: m.demographics?.map((d) => d.name) ?? [],
    aired_from: m.published?.from ?? undefined,
    aired_to: m.published?.to ?? undefined,
    relations,
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildParams(params: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") p.set(k, String(v));
  }
  return p.toString() ? `?${p.toString()}` : "";
}

// In-memory cache + sessionStorage (misma pestaña) para recargas y navegación interna.
// Jikan: ~3 req/s y 60 req/min en API pública; TTL largo reduce presión.
const JIKAN_TTL_MS = 12 * 60 * 1000;
const jikanCache = new Map<string, { value: unknown; expires: number }>();
const inflight = new Map<string, Promise<unknown>>();

const PERSIST_KEY = (path: string) => `aniratejk:${encodeURIComponent(path)}`;

function readSessionJikanCache<T>(path: string): { value: T; expires: number } | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PERSIST_KEY(path));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { expires: number; value: unknown };
    if (typeof parsed.expires !== "number" || parsed.expires <= Date.now()) {
      sessionStorage.removeItem(PERSIST_KEY(path));
      return null;
    }
    return { value: parsed.value as T, expires: parsed.expires };
  } catch {
    return null;
  }
}

function writeSessionJikanCache(path: string, value: unknown, expires: number) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PERSIST_KEY(path), JSON.stringify({ expires, value }));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k?.startsWith("aniratejk:")) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    }
  }
}

// Sin proxy: espaciar hacia api.jikan.moe. Con proxy: el backend ya ritma el upstream.
const MIN_INTERVAL_MS = jikanViaBackend ? 0 : 670;
let jikanQueueTail: Promise<void> = Promise.resolve();
let lastJikanReqStart = 0;

function scheduleJikan<T>(task: () => Promise<T>): Promise<T> {
  const run = jikanQueueTail.then(async () => {
    const now = Date.now();
    const gap = MIN_INTERVAL_MS - (now - lastJikanReqStart);
    if (gap > 0) await new Promise((r) => setTimeout(r, gap));
    lastJikanReqStart = Date.now();
    return task();
  });
  jikanQueueTail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function fetchJikanJson<T>(path: string, attempt = 0): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" } as RequestInit);
  if (res.status === 429 && attempt < 10) {
    const ra = res.headers.get("Retry-After");
    let delayMs = 3200 + 2200 * attempt + Math.floor(Math.random() * 400);
    if (ra) {
      const sec = Number.parseInt(ra, 10);
      if (!Number.isNaN(sec)) delayMs = Math.max(delayMs, sec * 1000);
    }
    await new Promise((r) => setTimeout(r, Math.min(delayMs, 120_000)));
    return fetchJikanJson<T>(path, attempt + 1);
  }
  if (!res.ok) throw new Error(`Jikan ${res.status}`);
  return (await res.json()) as T;
}

async function get<T>(path: string): Promise<T> {
  const now = Date.now();
  const cached = jikanCache.get(path);
  if (cached && cached.expires > now) return cached.value as T;

  const persisted = readSessionJikanCache<T>(path);
  if (persisted && persisted.expires > now) {
    jikanCache.set(path, { value: persisted.value, expires: persisted.expires });
    return persisted.value;
  }

  const existing = inflight.get(path);
  if (existing) return existing as Promise<T>;

  const promise = scheduleJikan(() => fetchJikanJson<T>(path))
    .then((json) => {
      const exp = Date.now() + JIKAN_TTL_MS;
      jikanCache.set(path, { value: json, expires: exp });
      writeSessionJikanCache(path, json, exp);
      return json;
    })
    .finally(() => {
      inflight.delete(path);
    });

  inflight.set(path, promise);
  return promise as Promise<T>;
}

export interface SearchOptions {
  q?: string;
  page?: number;
  genres?: number[];
  limit?: number;
  status?: string;       // airing | complete | upcoming (anime) / publishing | complete | upcoming (manga)
  type?: string;         // tv | movie | ova | ona | special (anime) / manga | manhwa | manhua | novel | light_novel (manga)
  min_score?: number;
  max_score?: number;
  start_year?: number;
  end_year?: number;
  order_by?: string;     // score | scored_by | rank | popularity | start_date | title
  sort?: "asc" | "desc";
  rating?: string;       // g | pg | pg13 | r17 | r | rx (anime only)
  producers?: number[];  // MAL producer/studio IDs (anime only)
}

export interface JikanProducer {
  mal_id: number;
  titles: { type: string; title: string }[];
  count: number;
  favorites: number;
}

export interface ProducerSuggestion {
  id: number;
  name: string;
  count: number;
}

export interface HeroNoveltiesCandidates {
  seasonNow: Contenido[];
  upcomingAnime: Contenido[];
  recentManga: Contenido[];
}

export const jikanApi = {
  // ── Simple (no paging) ───────────────────────────────────────────────────────

  getTrendingAnime: async (limit = 25, page = 1): Promise<Contenido[]> => {
    const data = await get<{ data: JikanAnime[] }>(
      `/top/anime${buildParams({ filter: "airing", limit: Math.min(limit, 25), page })}`
    );
    return data.data.map((a) => animeToContenido(a));
  },

  getTrendingManga: async (limit = 25, page = 1): Promise<Contenido[]> => {
    const data = await get<{ data: JikanManga[] }>(
      `/top/manga${buildParams({ filter: "publishing", limit: Math.min(limit, 25), page })}`
    );
    return data.data.map((m) => mangaToContenido(m));
  },

  /** Manga en publicación, ordenado por inicio de serialización (más recientes primero). */
  getRecentPublishingManga: async (limit = 25): Promise<Contenido[]> => {
    const data = await get<JikanPagedResult<JikanManga>>(
      `/manga${buildParams({
        limit: Math.min(limit, 25),
        sfw: "true",
        status: "publishing",
        order_by: "start_date",
        sort: "desc",
      })}`
    );
    return data.data.map((m) => mangaToContenido(m));
  },

  getTopAnime: async (limit = 25, page = 1): Promise<Contenido[]> => {
    const data = await get<{ data: JikanAnime[] }>(
      `/top/anime${buildParams({ limit: Math.min(limit, 25), page })}`
    );
    return data.data.map((a) => animeToContenido(a));
  },

  searchAnime: async (q: string, limit = 25): Promise<Contenido[]> => {
    const data = await get<{ data: JikanAnime[] }>(
      `/anime${buildParams({ q, limit: Math.min(limit, 25), sfw: "true" })}`
    );
    return data.data.map((a) => animeToContenido(a));
  },

  searchManga: async (q: string, limit = 25): Promise<Contenido[]> => {
    const data = await get<{ data: JikanManga[] }>(
      `/manga${buildParams({ q, limit: Math.min(limit, 25), sfw: "true" })}`
    );
    return data.data.map((m) => mangaToContenido(m));
  },

  searchAll: async (q: string): Promise<Contenido[]> => {
    const [animes, mangas] = await Promise.allSettled([
      jikanApi.searchAnime(q, 25),
      jikanApi.searchManga(q, 25),
    ]);
    return [
      ...(animes.status === "fulfilled" ? animes.value : []),
      ...(mangas.status === "fulfilled" ? mangas.value : []),
    ];
  },

  // ── Paged (with genre support) ────────────────────────────────────────────────

  searchAnimePaged: async (opts: SearchOptions): Promise<PagedContenido> => {
    const { q, page = 1, genres = [], limit = 25, status, type, min_score, max_score, start_year, end_year, order_by, sort, rating, producers = [] } = opts;
    const data = await get<JikanPagedResult<JikanAnime>>(
      `/anime${buildParams({
        q: q || undefined,
        page,
        limit: Math.min(limit, 25),
        sfw: "true",
        genres: genres.length ? genres.join(",") : undefined,
        status: status || undefined,
        type: type || undefined,
        min_score: min_score || undefined,
        max_score: max_score || undefined,
        start_date: start_year ? `${start_year}-01-01` : undefined,
        end_date: end_year ? `${end_year}-12-31` : undefined,
        order_by: order_by || undefined,
        sort: sort || undefined,
        rating: rating || undefined,
        producers: producers.length ? producers.join(",") : undefined,
      })}`
    );
    return {
      items: data.data.map((a) => animeToContenido(a)),
      totalPages: data.pagination.last_visible_page,
      currentPage: data.pagination.current_page,
      hasNext: data.pagination.has_next_page,
    };
  },

  searchMangaPaged: async (opts: SearchOptions): Promise<PagedContenido> => {
    const { q, page = 1, genres = [], limit = 25, status, type, min_score, max_score, start_year, end_year, order_by, sort } = opts;
    const data = await get<JikanPagedResult<JikanManga>>(
      `/manga${buildParams({
        q: q || undefined,
        page,
        limit: Math.min(limit, 25),
        sfw: "true",
        genres: genres.length ? genres.join(",") : undefined,
        status: status || undefined,
        type: type || undefined,
        min_score: min_score || undefined,
        max_score: max_score || undefined,
        start_date: start_year ? `${start_year}-01-01` : undefined,
        end_date: end_year ? `${end_year}-12-31` : undefined,
        order_by: order_by || undefined,
        sort: sort || undefined,
      })}`
    );
    return {
      items: data.data.map((m) => mangaToContenido(m)),
      totalPages: data.pagination.last_visible_page,
      currentPage: data.pagination.current_page,
      hasNext: data.pagination.has_next_page,
    };
  },

  getTrendingAnimePaged: async (page = 1, genres: number[] = []): Promise<PagedContenido> => {
    // Si hay géneros, usamos /anime (top no soporta genre filter)
    if (genres.length) {
      return jikanApi.searchAnimePaged({ page, genres });
    }
    const data = await get<JikanPagedResult<JikanAnime>>(
      `/top/anime${buildParams({ filter: "airing", limit: 25, page })}`
    );
    return {
      items: data.data.map((a) => animeToContenido(a)),
      totalPages: data.pagination.last_visible_page,
      currentPage: data.pagination.current_page,
      hasNext: data.pagination.has_next_page,
    };
  },

  getTrendingMangaPaged: async (page = 1, genres: number[] = []): Promise<PagedContenido> => {
    if (genres.length) {
      return jikanApi.searchMangaPaged({ page, genres });
    }
    const data = await get<JikanPagedResult<JikanManga>>(
      `/top/manga${buildParams({ filter: "publishing", limit: 25, page })}`
    );
    return {
      items: data.data.map((m) => mangaToContenido(m)),
      totalPages: data.pagination.last_visible_page,
      currentPage: data.pagination.current_page,
      hasNext: data.pagination.has_next_page,
    };
  },

  // ── Seasons ───────────────────────────────────────────────────────────────────

  getSeasonAnime: async (year: number, season: string, page = 1): Promise<PagedContenido> => {
    const data = await get<JikanPagedResult<JikanAnime>>(
      `/seasons/${year}/${season}${buildParams({ limit: 25, page })}`
    );
    return {
      items: data.data.map((a) => animeToContenido(a)),
      totalPages: data.pagination.last_visible_page,
      currentPage: data.pagination.current_page,
      hasNext: data.pagination.has_next_page,
    };
  },

  /** Anime de la temporada en curso (emisión actual). */
  getSeasonNow: async (limit = 25): Promise<Contenido[]> => {
    const data = await get<JikanPagedResult<JikanAnime>>(
      `/seasons/now${buildParams({ limit: Math.min(limit, 25) })}`
    );
    return data.data.map((a) => animeToContenido(a));
  },

  /** Próximos estrenos de temporada registrados en Jikan. */
  getSeasonUpcoming: async (limit = 25): Promise<Contenido[]> => {
    const data = await get<JikanPagedResult<JikanAnime>>(
      `/seasons/upcoming${buildParams({ limit: Math.min(limit, 25) })}`
    );
    return data.data.map((a) => animeToContenido(a));
  },

  /** Pools amplios para el hero (portadas ya vienen en cada listado). Encadenado para no disparar tres peticiones simultáneas. */
  getHeroNoveltiesCandidates: async (): Promise<HeroNoveltiesCandidates> => {
    const seasonNow = await jikanApi.getSeasonNow(25);
    const upcomingAnime = await jikanApi.getSeasonUpcoming(25);
    const recentManga = await jikanApi.getRecentPublishingManga(25);
    return { seasonNow, upcomingAnime, recentManga };
  },

  getSeasonsList: async (): Promise<{ year: number; seasons: string[] }[]> => {
    const data = await get<{ data: { year: number; seasons: string[] }[] }>(`/seasons`);
    return data.data;
  },

  // ── Detail ────────────────────────────────────────────────────────────────────

  getAnimeById: async (id: number): Promise<Contenido> => {
    const data = await get<{ data: JikanAnime }>(`/anime/${id}/full`);
    return animeToContenido(data.data, "detail");
  },

  getMangaById: async (id: number): Promise<Contenido> => {
    const data = await get<{ data: JikanManga }>(`/manga/${id}/full`);
    return mangaToContenido(data.data, "detail");
  },

  // ── Producers (studios) ───────────────────────────────────────────────────────

  searchProducers: async (q: string, limit = 8): Promise<ProducerSuggestion[]> => {
    if (!q.trim()) return [];
    const data = await get<{ data: JikanProducer[] }>(
      `/producers${buildParams({ q, limit: Math.min(limit, 25), order_by: "count", sort: "desc" })}`
    );
    return data.data.map((p) => {
      const def = p.titles.find((t) => t.type === "Default") ?? p.titles[0];
      return { id: p.mal_id, name: def?.title ?? `#${p.mal_id}`, count: p.count };
    });
  },
};
