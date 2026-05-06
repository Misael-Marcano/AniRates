import * as crypto from 'crypto';

export type EmailUnsubscribeScope = 'mentions' | 'digest' | 'all';

interface Payload {
  uid: number;
  scope: EmailUnsubscribeScope;
  exp: number;
}

const TTL_SEC = 365 * 24 * 3600;

function timingSafeEqualStrings(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function createEmailUnsubscribeToken(
  uid: number,
  scope: EmailUnsubscribeScope,
  secret: string,
): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC;
  const body = Buffer.from(JSON.stringify({ uid, scope, exp }), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyEmailUnsubscribeToken(
  token: string,
  secret: string,
): { uid: number; scope: EmailUnsubscribeScope } | null {
  const trimmed = token.trim();
  const dot = trimmed.indexOf('.');
  if (dot <= 0 || dot === trimmed.length - 1) return null;
  const body = trimmed.slice(0, dot);
  const sig = trimmed.slice(dot + 1);
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!timingSafeEqualStrings(sig, expected)) return null;
  try {
    const raw = Buffer.from(body, 'base64url').toString('utf8');
    const p = JSON.parse(raw) as Payload;
    if (!Number.isFinite(p.uid) || p.uid <= 0) return null;
    if (!['mentions', 'digest', 'all'].includes(p.scope)) return null;
    if (typeof p.exp !== 'number' || p.exp < Math.floor(Date.now() / 1000)) return null;
    return { uid: p.uid, scope: p.scope };
  } catch {
    return null;
  }
}
