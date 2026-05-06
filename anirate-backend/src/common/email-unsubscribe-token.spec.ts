import {
  createEmailUnsubscribeToken,
  verifyEmailUnsubscribeToken,
} from './email-unsubscribe-token';

describe('email-unsubscribe-token', () => {
  const secret = 'x'.repeat(32);

  it('roundtrips mentions scope', () => {
    const t = createEmailUnsubscribeToken(42, 'mentions', secret);
    expect(verifyEmailUnsubscribeToken(t, secret)).toEqual({ uid: 42, scope: 'mentions' });
  });

  it('roundtrips digest scope', () => {
    const t = createEmailUnsubscribeToken(7, 'digest', secret);
    expect(verifyEmailUnsubscribeToken(t, secret)).toEqual({ uid: 7, scope: 'digest' });
  });

  it('rejects tampered token', () => {
    const t = createEmailUnsubscribeToken(1, 'all', secret);
    const bad = `${t.slice(0, -4)}xxxx`;
    expect(verifyEmailUnsubscribeToken(bad, secret)).toBeNull();
  });

  it('rejects wrong secret', () => {
    const t = createEmailUnsubscribeToken(1, 'mentions', secret);
    expect(verifyEmailUnsubscribeToken(t, 'y'.repeat(32))).toBeNull();
  });
});
