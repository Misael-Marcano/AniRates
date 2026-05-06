import { IsString, MinLength, MaxLength } from 'class-validator';

export class PushSubscribeDto {
  @IsString()
  @MinLength(8)
  @MaxLength(2048)
  endpoint: string;

  @IsString()
  @MinLength(16)
  @MaxLength(512)
  p256dh: string;

  @IsString()
  @MinLength(8)
  @MaxLength(256)
  auth: string;
}

export class PushUnsubscribeDto {
  @IsString()
  @MinLength(8)
  @MaxLength(2048)
  endpoint: string;
}
