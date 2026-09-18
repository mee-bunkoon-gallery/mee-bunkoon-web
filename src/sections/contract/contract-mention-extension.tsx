import type {
  ContractMentionItem,
  MentionSuggestionListRef,
} from './contract-mention-suggestion-list';

import { ReactRenderer } from '@tiptap/react';
import Mention from '@tiptap/extension-mention';

import { CONTRACT_MENTION_FIELDS } from './contract-clauses';
import { MentionSuggestionList } from './contract-mention-suggestion-list';

// ----------------------------------------------------------------------

/**
 * Lets the contract clause editor insert a merge-field token by typing "@" — either a fixed
 * legal term (ผู้ว่าจ้าง / ผู้รับจ้าง) or a `{{key}}` placeholder (e.g. `{{customer_name}}`)
 * that resolves to the contract's actual data at preview/PDF time. Inserts plain text rather
 * than a Tiptap mention node, so `resolveContractMentionTokens` can run over the saved HTML
 * the same way it does for the plain clause-title field.
 */
export const ContractMentionExtension = Mention.configure({
  suggestion: {
    char: '@',
    items: ({ query }: { query: string }): ContractMentionItem[] =>
      CONTRACT_MENTION_FIELDS.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      ).map((option) => ({ id: option.value, label: option.value })),
    command: ({ editor, range, props }) => {
      editor.chain().focus().insertContentAt(range, `{{${props.id}}} `).run();
    },
    render: () => {
      let component: ReactRenderer<MentionSuggestionListRef> | null = null;
      let popup: HTMLDivElement | null = null;

      const positionPopup = (clientRect?: (() => DOMRect | null) | null) => {
        const rect = clientRect?.();
        if (!popup || !rect) return;

        popup.style.left = `${rect.left + window.scrollX}px`;
        popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
      };

      return {
        onStart: (props) => {
          component = new ReactRenderer(MentionSuggestionList, {
            props,
            editor: props.editor,
          });

          popup = document.createElement('div');
          popup.style.position = 'absolute';
          popup.style.zIndex = '1500';
          popup.appendChild(component.element);
          document.body.appendChild(popup);

          positionPopup(props.clientRect);
        },
        onUpdate: (props) => {
          component?.updateProps(props);
          positionPopup(props.clientRect);
        },
        onKeyDown: (props) => component?.ref?.onKeyDown(props) ?? false,
        onExit: () => {
          popup?.remove();
          popup = null;
          component?.destroy();
          component = null;
        },
      };
    },
  },
});
