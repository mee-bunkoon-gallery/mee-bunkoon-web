import type { ReactNode } from 'react';
import type { Style } from '@react-pdf/types';

import { Fragment } from 'react';
import { View, Text, Image } from '@react-pdf/renderer';

// ----------------------------------------------------------------------

type InlineFlags = { bold?: boolean; underline?: boolean; strike?: boolean };

/**
 * Converts the HTML a clause body is stored as (from the Tiptap-based clause editor) into
 * react-pdf primitives, so bold/lists/headings typed in the editor also show up in the PDF.
 * Only the tag set the editor can actually produce is handled; anything else falls through
 * to its children so no content is silently dropped. Client-only (uses DOMParser) — safe
 * here because ContractPdfDocument is always rendered via a `ssr: false` dynamic import.
 */
export function renderClauseBodyPdf(html: string, textStyle: Style): ReactNode[] {
  if (typeof DOMParser === 'undefined') return [];

  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.body.childNodes)
    .map((node, index) => renderBlock(node, index, textStyle))
    .filter((node) => node !== null);
}

function composeTextStyle(flags: InlineFlags, base: Style): Style {
  const style: Style = { ...base };

  if (flags.bold) style.fontWeight = 'bold';
  if (flags.underline && flags.strike) style.textDecoration = 'underline line-through';
  else if (flags.underline) style.textDecoration = 'underline';
  else if (flags.strike) style.textDecoration = 'line-through';

  return style;
}

function renderInline(nodes: ChildNode[], flags: InlineFlags, textStyle: Style): ReactNode[] {
  return nodes
    .map((node, index) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text) return null;
        return (
          <Text key={index} style={composeTextStyle(flags, textStyle)}>
            {text}
          </Text>
        );
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return null;

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const children = Array.from(el.childNodes);

      switch (tag) {
        case 'br':
          return <Text key={index}>{'\n'}</Text>;
        case 'strong':
        case 'b':
          return (
            <Fragment key={index}>
              {renderInline(children, { ...flags, bold: true }, textStyle)}
            </Fragment>
          );
        case 'u':
          return (
            <Fragment key={index}>
              {renderInline(children, { ...flags, underline: true }, textStyle)}
            </Fragment>
          );
        case 's':
        case 'strike':
        case 'del':
          return (
            <Fragment key={index}>
              {renderInline(children, { ...flags, strike: true }, textStyle)}
            </Fragment>
          );
        case 'a':
          return (
            <Fragment key={index}>
              {renderInline(children, { ...flags, underline: true }, textStyle)}
            </Fragment>
          );
        case 'span':
          // Mentions (ผู้ว่าจ้าง / ผู้รับจ้าง) render bold so they stand out in the printed clause.
          return (
            <Fragment key={index}>
              {renderInline(
                children,
                el.getAttribute('data-type') === 'mention' ? { ...flags, bold: true } : flags,
                textStyle
              )}
            </Fragment>
          );
        default:
          return <Fragment key={index}>{renderInline(children, flags, textStyle)}</Fragment>;
      }
    })
    .filter((node) => node !== null);
}

function renderBlock(node: ChildNode, index: number, textStyle: Style): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return null;
    return (
      <Text key={index} style={[textStyle, { marginBottom: 4 }]}>
        {text}
      </Text>
    );
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const children = Array.from(el.childNodes);

  if (/^h[1-6]$/.test(tag)) {
    const level = Number(tag[1]);
    return (
      <Text
        key={index}
        style={[
          textStyle,
          { fontWeight: 'bold', fontSize: Math.max(10, 15 - level), marginBottom: 4 },
        ]}
      >
        {renderInline(children, {}, textStyle)}
      </Text>
    );
  }

  if (tag === 'ul' || tag === 'ol') {
    const items = children.filter(
      (child) =>
        child.nodeType === Node.ELEMENT_NODE &&
        (child as HTMLElement).tagName.toLowerCase() === 'li'
    ) as HTMLElement[];

    return (
      <View key={index} style={{ marginBottom: 4 }}>
        {items.map((item, itemIndex) => (
          <View key={itemIndex} style={{ flexDirection: 'row', marginBottom: 2 }}>
            <Text style={[textStyle, { width: 14 }]}>
              {tag === 'ol' ? `${itemIndex + 1}.` : '•'}
            </Text>
            <Text style={[textStyle, { flex: 1 }]}>
              {renderInline(Array.from(item.childNodes), {}, textStyle)}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  if (tag === 'img') {
    const src = el.getAttribute('src');
    if (!src) return null;
    return <Image key={index} src={src} style={{ maxWidth: 200, marginBottom: 4 }} />;
  }

  if (tag === 'blockquote') {
    return (
      <View
        key={index}
        style={{ marginBottom: 4, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#DFE3E8' }}
      >
        {children.map((child, childIndex) => renderBlock(child, childIndex, textStyle))}
      </View>
    );
  }

  if (tag === 'p' || tag === 'div') {
    const inline = renderInline(children, {}, textStyle);
    if (!inline.length) return null;
    return (
      <Text key={index} style={[textStyle, { marginBottom: 4 }]}>
        {inline}
      </Text>
    );
  }

  // Unknown block-level tag: keep its children so content is never silently dropped.
  return (
    <Fragment key={index}>
      {children.map((child, childIndex) => renderBlock(child, childIndex, textStyle))}
    </Fragment>
  );
}
