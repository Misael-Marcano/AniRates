import { JikanProxyMetricsService } from './jikan-proxy-metrics.service';

describe('JikanProxyMetricsService', () => {
  it('counts cache hit and 200', () => {
    const m = new JikanProxyMetricsService();
    m.recordProxyResponse(true, 200);
    const s = m.getSnapshot();
    expect(s.proxy_requests).toBe(1);
    expect(s.cache_hits).toBe(1);
    expect(s.cache_misses).toBe(0);
    expect(s.http_200).toBe(1);
    expect(s.updated_at).not.toBeNull();
  });

  it('counts miss, upstream 429, and client throttle', () => {
    const m = new JikanProxyMetricsService();
    m.recordProxyResponse(false, 429);
    m.recordClientThrottle429();
    const s = m.getSnapshot();
    expect(s.cache_misses).toBe(1);
    expect(s.http_429).toBe(1);
    expect(s.client_throttle_429).toBe(1);
  });

  it('buckets 502 as 5xx', () => {
    const m = new JikanProxyMetricsService();
    m.recordProxyResponse(false, 502);
    expect(m.getSnapshot().http_5xx).toBe(1);
    expect(m.getSnapshot().http_4xx_other).toBe(0);
  });
});
