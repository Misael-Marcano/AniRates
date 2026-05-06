import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JikanProxyMiddleware } from './jikan-proxy.middleware';
import { JikanProxyService } from './jikan-proxy.service';

@Module({
  providers: [JikanProxyService, JikanProxyMiddleware],
})
export class JikanProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(JikanProxyMiddleware).forRoutes('*');
  }
}
