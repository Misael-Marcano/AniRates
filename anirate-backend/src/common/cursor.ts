/**
 * Cursor pagination helpers.
 *
 * Cursor = base64url(`${sortKey}|${id}`). Opaque to clients; decoded server-side.
 * Keeps tuple comparison stable even when primary sort key has ties.
 */

export function encodeCursor(sortKey: string | number, id: number): string {
  const raw = `${sortKey}|${id}`;
  return Buffer.from(raw, 'utf8').toString('base64url');
}

export function decodeCursor(
  cursor?: string,
): { sortKey: string; id: number } | null {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const idx = decoded.lastIndexOf('|');
    if (idx < 0) return null;
    const sortKey = decoded.slice(0, idx);
    const id = Number(decoded.slice(idx + 1));
    if (!Number.isFinite(id)) return null;
    return { sortKey, id };
  } catch {
    return null;
  }
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}

export function clampLimit(raw: unknown, def = 20, max = 50): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return def;
  return Math.max(1, Math.min(max, Math.floor(n)));
}
