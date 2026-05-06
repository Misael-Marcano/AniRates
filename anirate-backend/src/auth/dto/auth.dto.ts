import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class NotificationPrefsDto {
  @IsOptional()
  @IsBoolean()
  email_mentions?: boolean;

  @IsOptional()
  @IsBoolean()
  email_weekly_digest?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  digest_timezone?: string;

  @IsOptional()
  @IsBoolean()
  push_in_app_browser?: boolean;

  /** Grid completo por `Notificacion.tipo` (in_app, email, push). Validación estricta en servidor. */
  @IsOptional()
  @IsObject()
  tipo_channels?: Record<string, unknown>;
}

export class RegisterDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(500)
  avatar_url?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPrefsDto)
  notification_prefs?: NotificationPrefsDto;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class TwoFactorEnableDto {
  @IsString()
  code: string;
}

export class TwoFactorDisableDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  code?: string;
}

export class TwoFactorLoginVerifyDto {
  @IsString()
  pending_token: string;

  @IsString()
  code: string;
}

export class EmailUnsubscribeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(16)
  @MaxLength(8192)
  token: string;
}
