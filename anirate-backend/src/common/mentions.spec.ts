import {
  extractMentionUserIdsFromMarkdown,
  mentionUserIdsDelta,
} from './mentions';

describe('mentions', () => {
  describe('extractMentionUserIdsFromMarkdown', () => {
    it('returns empty for empty input', () => {
      expect(extractMentionUserIdsFromMarkdown('')).toEqual([]);
    });

    it('extracts user ids from usuarios markdown links', () => {
      const text = 'Hola [Alice](/usuario/12) y [Bob](/usuario/34) fin.';
      const ids = extractMentionUserIdsFromMarkdown(text);
      expect(ids).toContain(12);
      expect(ids).toContain(34);
      expect(ids.length).toBe(2);
    });

    it('deduplicates duplicate links', () => {
      const text = '[a](/usuario/7) [b](/usuario/7)';
      expect(extractMentionUserIdsFromMarkdown(text)).toEqual([7]);
    });
  });

  describe('mentionUserIdsDelta', () => {
    it('returns only newly added ids', () => {
      const prev = '[a](/usuario/1)';
      const next = '[a](/usuario/1) [b](/usuario/2)';
      expect(mentionUserIdsDelta(prev, next)).toEqual([2]);
    });

    it('returns empty when no new mentions', () => {
      const t = '[a](/usuario/3)';
      expect(mentionUserIdsDelta(t, t)).toEqual([]);
    });
  });
});
