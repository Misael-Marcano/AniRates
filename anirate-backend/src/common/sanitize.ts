/**
 * Plain-text sanitizer for user-generated content.
 * Strips HTML tags + dangerous protocols. Trims + clamps length. Preserves newlines.
 */
export function sanitizePlainText(input: string, maxLen = 5000): string {
  if (!input) return '';
  const noTags = input.replace(/<[^>]*>/g, '');
  const noProto = noTags
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
  const collapsed = noProto.replace(/ /g, '').replace(/\r\n?/g, '\n');
  return collapsed.trim().slice(0, maxLen);
}

/**
 * Markdown sanitizer for review comments + replies. Strips HTML tags (markdown-only)
 * + dangerous protocols. Preserves markdown chars (* _ [ ] # > etc.) so client can render.
 * Spoiler syntax ||hidden|| is plain text, no HTML.
 */
export function sanitizeMarkdown(input: string, maxLen = 5000): string {
  if (!input) return '';
  // Remove HTML tags and HTML comments — markdown doesn't need raw HTML
  const noTags = input
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  // Strip dangerous protocols inside markdown links/images
  const noProto = noTags
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  const normalized = noProto.replace(/\r\n?/g, '\n');
  return normalized.trim().slice(0, maxLen);
}
