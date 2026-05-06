import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { JikanProxyMetricsService } from './jikan-proxy-metrics.service';
import { JikanProxyService } from './jikan-proxy.service';

const PREFIX = '/jikan/v4/';

/** Sustituye @Throttle del controller (los guards no aplican a middleware que responde solo). */
const THROTTLE_SHORT_MS = 1000;
const THROTTLE_SHORT_MAX = 40;
const THROTTLE_LONG_MS = 60_000;
const THROTTLE_LONG_MAX = 400;

type HitBucket = { short: number[]; long: number[] };

@Injectable()
export class JikanProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JikanProxyMiddleware.name);
  private readonly throttleBuckets = new Map<string, HitBucket>();

  constructor(
    private readonly jikanProxy: JikanProxyService,
    private readonly jikanMetrics: JikanProxyMetricsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const pathname = req.originalUrl.split('?')[0] ?? '';
    if (!pathname.startsWith(PREFIX)) {
      next();
      return;
    }

    const ip =
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0]?.trim()
        : null) ?? req.ip ?? req.socket.remoteAddress ?? 'unknown';

    if (!this.allowThrottle(ip)) {
      this.jikanMetrics.recordClientThrottle429();
      res.status(429).json({
        error: 'Too many requests',
        message: 'Demasiadas peticiones al proxy Jikan desde esta IP.',
      });
      return;
    }

    const jikanPath = pathname.slice(PREFIX.length).replace(/^\/+/, '');
    if (!jikanPath || jikanPath.includes('..')) {
      this.jikanMetrics.recordClientInvalidPath400();
      res.status(400).json({ error: 'Ruta Jikan inválida' });
      return;
    }

    const qs = req.originalUrl.includes('?')
      ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
      : '';

    try {
      const result = await this.jikanProxy.proxyV4(jikanPath, qs);
      this.jikanMetrics.recordProxyResponse(result.fromCache, result.status);
      res.setHeader('X-Cache', result.fromCache ? 'HIT' : 'MISS');
      if (result.retryAfter) {
        res.setHeader('Retry-After', result.retryAfter);
      }
      res.status(result.status).json(result.body);
    } catch (err) {
      this.jikanMetrics.recordProxyHandlerError();
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`proxy falló ${pathname}: ${msg}`);
      next(err);
    }
  }

  private allowThrottle(ip: string): boolean {
    const now = Date.now();
    let b = this.throttleBuckets.get(ip);
    if (!b) {
      b = { short: [], long: [] };
      this.throttleBuckets.set(ip, b);
    }
    b.short = b.short.filter((t) => now - t < THROTTLE_SHORT_MS);
    b.long = b.long.filter((t) => now - t < THROTTLE_LONG_MS);
    if (b.short.length >= THROTTLE_SHORT_MAX || b.long.length >= THROTTLE_LONG_MAX) {
      return false;
    }
    b.short.push(now);
    b.long.push(now);
    return true;
  }
}

