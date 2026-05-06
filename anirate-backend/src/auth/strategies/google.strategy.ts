import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  displayName: string;
  avatar?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? 'missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'missing',
      callbackURL: `${process.env.BACKEND_URL ?? 'http://localhost:5001'}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value ?? '';
    const oauthProfile: OAuthProfile = {
      provider: 'google',
      providerId: profile.id,
      email,
      displayName: profile.displayName,
      avatar: profile.photos?.[0]?.value,
    };
    done(null, oauthProfile);
  }
}
