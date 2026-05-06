import { Global, Module } from '@nestjs/common';
import { JikanProxyMetricsService } from './jikan-proxy-metrics.service';

@Global()
@Module({
  providers: [JikanProxyMetricsService],
  exports: [JikanProxyMetricsService],
})
export class JikanProxyMetricsModule {}
