export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Normalizes plain, newline-separated text (the format used by fields before they became
 * a rich text `Editor`) into the same <p>-per-line HTML shape the editor itself produces,
 * so old and new content can be rendered/parsed through one path. A string that already
 * looks like HTML is returned unchanged.
 */
export function ensureHtmlContent(text: string): string {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text;

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');
}

/**
 * Extracts readable plain text from editor HTML (paragraphs/list items become lines), for
 * places that still work with plain text, e.g. prefilling an older plain textarea from a
 * field that has since become a rich text `Editor`.
 */
export function htmlToPlainText(html: string): string {
  const normalized = ensureHtmlContent(html);
  if (!normalized) return '';
  if (typeof DOMParser === 'undefined') return normalized.replace(/<[^>]+>/g, '');

  const doc = new DOMParser().parseFromString(normalized, 'text/html');
  const lines: string[] = [];

  const collect = (node: ChildNode) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === 'li' || tag === 'p' || tag === 'div' || /^h[1-6]$/.test(tag)) {
        const text = el.textContent?.trim();
        if (text) lines.push(text);
        return;
      }
    }
    node.childNodes.forEach(collect);
  };

  doc.body.childNodes.forEach(collect);

  return lines.join('\n');
}
