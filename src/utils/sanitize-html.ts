import sanitizeHtml from 'sanitize-html';

// ----------------------------------------------------------------------

/**
 * Strips scripts, event handlers and unsafe URLs from rich-text HTML before it is
 * injected with `dangerouslySetInnerHTML`. The allow-list covers what the Tiptap
 * editor can produce (headings, lists, links, images, code, text-align, mentions).
 */
export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      ...['p', 'br', 'hr', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'code'],
      ...['pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ],
    allowedAttributes: {
      '*': ['class', 'data-type', 'data-id', 'data-label'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      p: ['style'],
      'h1,h2,h3,h4,h5,h6': ['style'],
    },
    allowedStyles: { '*': { 'text-align': [/^(left|right|center|justify)$/] } },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  });
}
