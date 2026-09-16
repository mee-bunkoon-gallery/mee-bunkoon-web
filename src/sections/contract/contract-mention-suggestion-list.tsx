'use client';

import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

import { CONTRACT_MENTION_FIELDS } from './contract-clauses';

// ----------------------------------------------------------------------

export type ContractMentionItem = { id: string; label: string };

export type MentionSuggestionListRef = {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
};

export const MentionSuggestionList = forwardRef<
  MentionSuggestionListRef,
  SuggestionProps<ContractMentionItem>
>(({ items, command }, ref) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setActiveIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (!items.length) return false;

      if (event.key === 'ArrowDown') {
        setActiveIndex((index) => (index + 1) % items.length);
        return true;
      }

      if (event.key === 'ArrowUp') {
        setActiveIndex((index) => (index - 1 + items.length) % items.length);
        return true;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        command(items[activeIndex]);
        return true;
      }

      return false;
    },
  }));

  if (!items.length) return null;

  return (
    <Paper elevation={4} sx={{ minWidth: 220 }}>
      <MenuList dense>
        {items.map((item, index) => {
          const option = CONTRACT_MENTION_FIELDS.find((mention) => mention.value === item.label);

          return (
            <MenuItem
              key={item.id}
              selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => command(item)}
            >
              {option?.label ?? item.label}
            </MenuItem>
          );
        })}
      </MenuList>
    </Paper>
  );
});

MentionSuggestionList.displayName = 'MentionSuggestionList';
