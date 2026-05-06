/**
 * User mentions in markdown: `[@Nombre](/usuario/:id)` inserted by the client.
 */
const MENTION_LINK_RE = /\[[^\]\n]+\]\(\/usuario\/(\d+)\)/g;

export function extractMentionUserIdsFromMarkdown(text: string): number[] {
  if (!text) return [];
  const ids = new Set<number>();
  let m: RegExpExecArray | null;
  const re = new RegExp(MENTION_LINK_RE.source, 'g');
  while ((m = re.exec(text)) !== null) {
    const id = Number(m[1]);
    if (Number.isFinite(id) && id > 0) ids.add(id);
  }
  return [...ids];
}

/** User IDs newly present in `next` compared to `previous` (for edit notifications). */
export function mentionUserIdsDelta(previous: string, next: string): number[] {
  const oldSet = new Set(extractMentionUserIdsFromMarkdown(previous));
  return extractMentionUserIdsFromMarkdown(next).filter(
    (id) => !oldSet.has(id),
  );
}
