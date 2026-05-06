import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get('health')
  @HealthCheck()
  @Throttle({ short: { limit: 60, ttl: 60000 } })
  async liveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @Throttle({ short: { limit: 30, ttl: 60000 } })
  async readiness() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 1500 }),
      () =>
        this.http.pingCheck('jikan', 'https://api.jikan.moe/v4', {
          timeout: 3000,
        }),
    ]);
  }
}
