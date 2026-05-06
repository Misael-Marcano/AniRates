import { plainToInstance } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumberString,
  IsIn,
  MinLength,
  validateSync,
} from 'class-validator';

class EnvSchema {
  @IsOptional() @IsIn(['development', 'production', 'test']) NODE_ENV?: string;
  @IsOptional() @IsNumberString() PORT?: string;
  @IsOptional() @IsString() FRONTEND_URL?: string;

  @IsOptional() @IsString() DB_HOST?: string;
  @IsOptional() @IsNumberString() DB_PORT?: string;
  @IsOptional() @IsString() DB_USER?: string;
  @IsOptional() @IsString() DB_PASS?: string;
  @IsOptional() @IsString() DB_NAME?: string;
  @IsOptional() @IsNumberString() DB_POOL_MAX?: string;
  @IsOptional() @IsNumberString() DB_POOL_MIN?: string;

  @IsString()
  @MinLength(16, { message: 'JWT_SECRET debe tener al menos 16 caracteres' })
  JWT_SECRET: string;

  @IsOptional() @IsString() MAIL_FROM?: string;
  @IsOptional() @IsString() RESEND_API_KEY?: string;
  @IsOptional() @IsString() SMTP_HOST?: string;
  @IsOptional() @IsNumberString() SMTP_PORT?: string;
  @IsOptional() @IsString() SMTP_USER?: string;
  @IsOptional() @IsString() SMTP_PASS?: string;
  @IsOptional() @IsString() SMTP_SECURE?: string;

  @IsOptional() @IsString() SENTRY_DSN?: string;
  @IsOptional()
  @IsIn(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
  LOG_LEVEL?: string;

  @IsOptional() @IsString() REDIS_URL?: string;

  @IsOptional() @IsString() BACKEND_URL?: string;
  @IsOptional() @IsString() GOOGLE_CLIENT_ID?: string;
  @IsOptional() @IsString() GOOGLE_CLIENT_SECRET?: string;
  @IsOptional() @IsString() DISCORD_CLIENT_ID?: string;
  @IsOptional() @IsString() DISCORD_CLIENT_SECRET?: string;
  @IsOptional() @IsString() GITHUB_CLIENT_ID?: string;
  @IsOptional() @IsString() GITHUB_CLIENT_SECRET?: string;

  @IsOptional() @IsString() TMDB_API_KEY?: string;
  @IsOptional() @IsString() LIBRETRANSLATE_URL?: string;
  @IsOptional() @IsString() LIBRETRANSLATE_API_KEY?: string;

  /** Subida de imágenes en reviews (Cloudinary). Opcional en dev. */
  @IsOptional() @IsString() CLOUDINARY_CLOUD_NAME?: string;
  @IsOptional() @IsString() CLOUDINARY_API_KEY?: string;
  @IsOptional() @IsString() CLOUDINARY_API_SECRET?: string;
  @IsOptional() @IsString() CLOUDINARY_REVIEW_FOLDER?: string;

  /** Web Push (VAPID). Opcional; sin ellos /push/subscribe responde 503. */
  @IsOptional() @IsString() VAPID_PUBLIC_KEY?: string;
  @IsOptional() @IsString() VAPID_PRIVATE_KEY?: string;
  /** mailto:contacto@dominio o URL https del sitio (requerido por web-push). */
  @IsOptional() @IsString() VAPID_SUBJECT?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvSchema, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
    throw new Error(`Configuración inválida:\n  - ${messages.join('\n  - ')}`);
  }

  if (validated.NODE_ENV === 'production') {
    const missing: string[] = [];
    if (!validated.MAIL_FROM) missing.push('MAIL_FROM');
    if (!validated.RESEND_API_KEY && !validated.SMTP_HOST)
      missing.push('RESEND_API_KEY o SMTP_HOST');
    if (!validated.FRONTEND_URL) missing.push('FRONTEND_URL');
    if (missing.length) {
      throw new Error(`Producción requiere: ${missing.join(', ')}`);
    }
  }

  return validated;
}
