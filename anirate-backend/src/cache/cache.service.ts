import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

interface MemoryEntry {
  value: unknown;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly memory = new Map<string, MemoryEntry>();
  private readonly redis: Redis | null;

  constructor() {
    const url = process.env.REDIS_URL;
    if (url) {
      this.redis = new Redis(url, {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => Math.min(times * 200, 2000),
      });
      this.redis.on('error', (err) =>
        this.logger.warn(`Redis error: ${err.message}`),
      );
      this.redis.connect().catch((err) => {
        this.logger.warn(
          `Redis no disponible (${err.message}), fallback a memoria`,
        );
      });
      this.logger.log('Cache provider: Redis');
    } else {
      this.redis = null;
      this.logger.log('Cache provider: in-memory (REDIS_URL no configurado)');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redis && this.redis.status === 'ready') {
      try {
        const raw = await this.redis.get(key);
        if (!raw) return null;
        try {
          return JSON.parse(raw) as T;
        } catch {
          await this.redis.del(key).catch(() => undefined);
          return null;
        }
      } catch {
        // fallback memoria
      }
    }
    const entry = this.memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (this.redis && this.redis.status === 'ready') {
      try {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch {
        // fallback memoria
      }
    }
    this.memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    if (this.redis && this.redis.status === 'ready') {
      try {
        await this.redis.del(key);
      } catch {
        /* noop */
      }
    }
    this.memory.delete(key);
  }

  async wrap<T>(
    key: string,
    ttlSeconds: number,
    fn: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await fn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit().catch(() => undefined);
    }
  }
}
