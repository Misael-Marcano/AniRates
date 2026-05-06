import { Injectable } from '@nestjs/common';

export interface JikanProxyMetricsSnapshot {
  /** Peticiones que llegaron a `proxyV4` y respondieron JSON al cliente. */
  proxy_requests: number;
  cache_hits: number;
  cache_misses: number;
  http_200: number;
  http_429: number;
  http_4xx_other: number;
  http_5xx: number;
  /** 429 del rate limit propio del middleware (antes de upstream). */
  client_throttle_429: number;
  /** 400 por ruta inválida antes de llamar al servicio. */
  client_invalid_path_400: number;
  /** Excepciones no capturadas en el handler del proxy. */
  proxy_handler_errors: number;
  updated_at: string | null;
}

@Injectable()
export class JikanProxyMetricsService {
  private proxy_requests = 0;
  private cache_hits = 0;
  private cache_misses = 0;
  private http_200 = 0;
  private http_429 = 0;
  private http_4xx_other = 0;
  private http_5xx = 0;
  private client_throttle_429 = 0;
  private client_invalid_path_400 = 0;
  private proxy_handler_errors = 0;
  private updated_at: Date | null = null;

  recordClientThrottle429(): void {
    this.client_throttle_429 += 1;
    this.touch();
  }

  recordClientInvalidPath400(): void {
    this.client_invalid_path_400 += 1;
    this.touch();
  }

  recordProxyHandlerError(): void {
    this.proxy_handler_errors += 1;
    this.touch();
  }

  recordProxyResponse(fromCache: boolean | undefined, status: number): void {
    this.proxy_requests += 1;
    if (fromCache === true) {
      this.cache_hits += 1;
    } else {
      this.cache_misses += 1;
    }
    if (status === 200) {
      this.http_200 += 1;
    } else if (status === 429) {
      this.http_429 += 1;
    } else if (status >= 500) {
      this.http_5xx += 1;
    } else if (status >= 400) {
      this.http_4xx_other += 1;
    }
    this.touch();
  }

  getSnapshot(): JikanProxyMetricsSnapshot {
    return {
      proxy_requests: this.proxy_requests,
      cache_hits: this.cache_hits,
      cache_misses: this.cache_misses,
      http_200: this.http_200,
      http_429: this.http_429,
      http_4xx_other: this.http_4xx_other,
      http_5xx: this.http_5xx,
      client_throttle_429: this.client_throttle_429,
      client_invalid_path_400: this.client_invalid_path_400,
      proxy_handler_errors: this.proxy_handler_errors,
      updated_at: this.updated_at?.toISOString() ?? null,
    };
  }

  private touch(): void {
    this.updated_at = new Date();
  }
}
