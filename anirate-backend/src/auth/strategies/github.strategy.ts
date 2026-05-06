import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import type { OAuthProfile } from './google.strategy';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID ?? 'missing',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? 'missing',
      callbackURL: `${process.env.BACKEND_URL ?? 'http://localhost:5001'}/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: OAuthProfile) => void,
  ): void {
    const email = profile.emails?.[0]?.value ?? '';
    const oauthProfile: OAuthProfile = {
      provider: 'github',
      providerId: profile.id,
      email,
      displayName: profile.displayName ?? profile.username ?? '',
      avatar: profile.photos?.[0]?.value,
    };
    done(null, oauthProfile);
  }
}
