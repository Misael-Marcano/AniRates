import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import * as crypto from 'crypto';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { ContenidoModule } from './contenido/contenido.module';
import { RatingsModule } from './ratings/ratings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ListaModule } from './lista/lista.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';
import { ListasPersonalizadasModule } from './listas-personalizadas/listas-personalizadas.module';
import { RecomendacionesModule } from './recomendaciones/recomendaciones.module';
import { MailModule } from './mail/mail.module';
import { HealthModule } from './health/health.module';
import { CacheModule } from './cache/cache.module';
import { PersonajesModule } from './personajes/personajes.module';
import { StreamingModule } from './streaming/streaming.module';
import { ImportModule } from './import/import.module';
import { SynopsisModule } from './synopsis/synopsis.module';
import { JikanProxyMetricsModule } from './jikan-proxy/jikan-proxy-metrics.module';
import { JikanProxyModule } from './jikan-proxy/jikan-proxy.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DigestModule } from './digest/digest.module';
import {
  Usuario,
  Genero,
  Contenido,
  ContenidoReport,
  ModeracionLog,
  Rating,
  Review,
  ReviewVersion,
  ReviewReport,
  UserReport,
  ReviewVoto,
  ReviewRespuesta,
  Favorito,
  ListaItem,
  Notificacion,
  Seguimiento,
  ListaPersonalizada,
  ListaPersonalizadaContenido,
  PasswordResetToken,
  EmailVerificationToken,
  Sesion,
  TwoFactorSecret,
  Personaje,
  VoiceActor,
  ContenidoPersonaje,
  PersonajeVoiceActor,
  OAuthAccount,
  FavoritoPersonaje,
  PushSubscription,
} from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        genReqId: (req, res) => {
          const existing = req.headers['x-request-id'];
          const id =
            (typeof existing === 'string' && existing) ||
            crypto.randomBytes(8).toString('hex');
          res.setHeader('x-request-id', id);
          return id;
        },
        customProps: (req) => ({
          user_id:
            (req as { user?: { id?: number; sub?: number } }).user?.id ??
            (req as { user?: { id?: number; sub?: number } }).user?.sub ??
            null,
        }),
        serializers: {
          req: (req) => ({ id: req.id, method: req.method, url: req.url }),
          res: (res) => ({ statusCode: res.statusCode }),
        },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.newPassword',
            'req.body.currentPassword',
          ],
          remove: true,
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { singleLine: true, translateTime: 'HH:MM:ss' },
              }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'long', ttl: 60000, limit: 60 },
    ]),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST ?? 'localhost',
      username: process.env.DB_USER ?? 'sa',
      password: process.env.DB_PASS ?? '',
      database: process.env.DB_NAME ?? 'AniRate',
      entities: [
        Usuario,
        Genero,
        Contenido,
        ContenidoReport,
        Rating,
        Review,
        ReviewVersion,
        ReviewReport,
        UserReport,
        ReviewVoto,
        ReviewRespuesta,
        Favorito,
        ListaItem,
        Notificacion,
        Seguimiento,
        ListaPersonalizada,
        ListaPersonalizadaContenido,
        PasswordResetToken,
        EmailVerificationToken,
        Sesion,
        TwoFactorSecret,
        Personaje,
        VoiceActor,
        ContenidoPersonaje,
        PersonajeVoiceActor,
        OAuthAccount,
        FavoritoPersonaje,
        PushSubscription,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
      migrationsRun: process.env.NODE_ENV === 'production',
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      migrationsTableName: 'migrations',
      port: parseInt(process.env.DB_PORT ?? '1433'),
      options: {
        trustServerCertificate: true,
        encrypt: false,
      },
      pool: {
        max: parseInt(
          process.env.DB_POOL_MAX ??
            (process.env.NODE_ENV === 'production' ? '50' : '10'),
        ),
        min: parseInt(process.env.DB_POOL_MIN ?? '2'),
        idleTimeoutMillis: 30000,
      },
    }),
    CacheModule,
    ScheduleModule.forRoot(),
    MailModule,
    HealthModule,
    DigestModule,
    AuthModule,
    ContenidoModule,
    RatingsModule,
    ReviewsModule,
    FavoritesModule,
    ListaModule,
    NotificacionesModule,
    StatsModule,
    UsersModule,
    ListasPersonalizadasModule,
    RecomendacionesModule,
    PersonajesModule,
    StreamingModule,
    ImportModule,
    SynopsisModule,
    JikanProxyMetricsModule,
    JikanProxyModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
