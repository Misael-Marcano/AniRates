import { Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { DiscordStrategy } from './strategies/discord.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import {
  Usuario,
  PasswordResetToken,
  EmailVerificationToken,
  Sesion,
  TwoFactorSecret,
  OAuthAccount,
} from '../database/entities';
import { PushModule } from '../push/push.module';

const oauthProviders: Provider[] = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  oauthProviders.push(GoogleStrategy);
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET)
  oauthProviders.push(DiscordStrategy);
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
  oauthProviders.push(GitHubStrategy);

@Module({
  imports: [
    PushModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'anirate-secret',
      signOptions: { expiresIn: '15m' },
    }),
    TypeOrmModule.forFeature([
      Usuario,
      PasswordResetToken,
      EmailVerificationToken,
      Sesion,
      TwoFactorSecret,
      OAuthAccount,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...oauthProviders],
  exports: [JwtModule],
})
export class AuthModule {}
