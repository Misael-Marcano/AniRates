import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.use(urlencoded({ extended: true, limit: '16kb' }));

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5000',
    credentials: true,
  });

  if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app.getHttpAdapter().getInstance());
  }

  const port = process.env.PORT ?? 5001;
  await app.listen(port);
  app.get(Logger).log(`AniRate API running on http://localhost:${port}`);
}
bootstrap();
