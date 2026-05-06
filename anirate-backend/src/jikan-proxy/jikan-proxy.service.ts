import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

interface ProxyResult {
  status: number;
  body: unknown;
  retryAfter?: string;
  /** Solo respuesta en vivo al cliente; no se persiste en Redis */
  fromCache?: boolean;
}

interface CachedJikanPayload {
  status: number;
  body: unknown;
}

const UPSTREAM_ROOT = (
  process.env.JIKAN_UPSTREAM_ROOT ?? 'https://api.jikan.moe'
).replace(/\/$/, '');
const MIN_GAP_MS = parseInt(process.env.JIKAN_PROXY_MIN_GAP_MS ?? '650', 10);
const TTL_FULL = parseInt(process.env.JIKAN_CACHE_TTL_FULL_SEC ?? '3600', 10);
const TTL_LIST = parseInt(process.env.JIKAN_CACHE_TTL_LIST_SEC ?? '900', 10);
const TTL_DEFAULT = parseInt(
  process.env.JIKAN_CACHE_TTL_DEFAULT_SEC ?? '600',
  10,
);

@Injectable()
export class JikanProxyService {
  private readonly logger = new Logger(JikanProxyService.name);
  private readonly inflight = new Map<string, Promise<ProxyResult>>();
  private queueTail: Promise<void> = Promise.resolve();
  private lastUpstreamStart = 0;

  constructor(private readonly cache: CacheService) {}

  /** segments después de `v4/` (ej. `seasons/now`), sin barra inicial */
  async proxyV4(jikanPath: string, queryString: string): Promise<ProxyResult> {
    const normalizedPath = jikanPath.replace(/^\/+/, '').replace(/\/+$/, '');
    if (!normalizedPath || normalizedPath.includes('..')) {
      return {
        status: 400,
        body: { error: 'Invalid path' },
        fromCache: false,
      };
    }

    const qs =
      queryString && queryString.startsWith('?')
        ? queryString
        : queryString
          ? `?${queryString}`
          : '';
    const cacheKey = `jikan:v4:${normalizedPath}${qs}`;
    const ttl = this.ttlSeconds(normalizedPath);

    const cached = await this.cache.get<CachedJikanPayload>(cacheKey);
    if (cached && cached.status === 200) {
      return { status: cached.status, body: cached.body, fromCache: true };
    }

    let pending = this.inflight.get(cacheKey);
    if (!pending) {
      pending = this.fetchUpstream(`/v4/${normalizedPath}${qs}`).finally(() => {
        this.inflight.delete(cacheKey);
      });
      this.inflight.set(cacheKey, pending);
    }

    const result = await pending;
    if (result.status === 200 && ttl > 0) {
      await this.cache.set(
        cacheKey,
        { status: result.status, body: result.body },
        ttl,
      );
    }
    return { ...result, fromCache: false };
  }

  private ttlSeconds(pathLower: string): number {
    const p = pathLower.toLowerCase();
    if (p.includes('/full')) return TTL_FULL;
    if (
      p.startsWith('top/') ||
      p.startsWith('seasons') ||
      p.startsWith('genres') ||
      p.startsWith('producers') ||
      p.startsWith('random')
    ) {
      return TTL_LIST;
    }
    return TTL_DEFAULT;
  }

  private schedule<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queueTail.then(() => task());
    this.queueTail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private async fetchUpstream(pathAndQuery: string): Promise<ProxyResult> {
    const url = `${UPSTREAM_ROOT}${pathAndQuery}`;
    const maxAttempts = 8;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await this.schedule(async () => {
        const now = Date.now();
        const gap = MIN_GAP_MS - (now - this.lastUpstreamStart);
        if (gap > 0) await new Promise((r) => setTimeout(r, gap));
        this.lastUpstreamStart = Date.now();
        return fetch(url, {
          headers: { Accept: 'application/json' },
          redirect: 'follow',
        });
      });

      const retryAfter = res.headers.get('retry-after') ?? undefined;
      const text = await res.text();
      let body: unknown;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = { error: 'Non-JSON upstream', raw: text.slice(0, 500) };
      }

      if (res.status === 429 && attempt < maxAttempts - 1) {
        let delayMs = 2800 + attempt * 1800 + Math.floor(Math.random() * 400);
        if (retryAfter) {
          const sec = Number.parseInt(retryAfter, 10);
          if (!Number.isNaN(sec)) delayMs = Math.max(delayMs, sec * 1000);
        }
        this.logger.warn(
          `Jikan 429, reintentando en ${delayMs}ms (${pathAndQuery})`,
        );
        await new Promise((r) => setTimeout(r, Math.min(delayMs, 120_000)));
        continue;
      }

      return { status: res.status, body, retryAfter };
    }

    return { status: 503, body: { error: 'Jikan upstream exhausted retries' } };
  }
}
