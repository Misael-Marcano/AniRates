import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-discord';
import type { OAuthProfile } from './google.strategy';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      clientID: process.env.DISCORD_CLIENT_ID ?? 'missing',
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? 'missing',
      callbackURL: `${process.env.BACKEND_URL ?? 'http://localhost:5001'}/auth/discord/callback`,
      scope: ['identify', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: OAuthProfile) => void,
  ): void {
    const oauthProfile: OAuthProfile = {
      provider: 'discord',
      providerId: profile.id,
      email: profile.email ?? '',
      displayName: profile.username,
      avatar: profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        : undefined,
    };
    done(null, oauthProfile);
  }
}
