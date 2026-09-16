'use client';

import type { TextFieldProps } from '@mui/material/TextField';

import { useRef, useState, useCallback } from 'react';

import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TextField from '@mui/material/TextField';
import ClickAwayListener from '@mui/material/ClickAwayListener';

// ----------------------------------------------------------------------

export type MentionOption = { value: string; label: string };

type InputEl = HTMLInputElement | HTMLTextAreaElement;

type MentionMatch = { start: number; query: string };

function findMentionMatch(text: string, caret: number): MentionMatch | null {
  const upToCaret = text.slice(0, caret);
  const at = upToCaret.lastIndexOf('@');
  if (at === -1) return null;

  const query = upToCaret.slice(at + 1);
  if (/[\s@]/.test(query)) return null;

  return { start: at, query };
}

export type MentionTextFieldProps = Omit<TextFieldProps, 'value' | 'onChange' | 'inputRef'> & {
  value: string;
  onChange: (value: string) => void;
  mentionOptions: MentionOption[];
};

/**
 * A plain TextField that opens a suggestion list when the user types "@", inserting a
 * `{{key}}` merge-field token (e.g. `{{customer_name}}`) resolved to real contract data
 * at preview/PDF time — see `resolveContractMentionTokens`.
 */
export function MentionTextField({
  value,
  onChange,
  mentionOptions,
  onBlur,
  ...other
}: MentionTextFieldProps) {
  const inputElRef = useRef<InputEl | null>(null);
  const [match, setMatch] = useState<MentionMatch | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const options = match
    ? mentionOptions.filter((option) => option.label.toLowerCase().includes(match.query.toLowerCase()))
    : [];

  const closeMention = useCallback(() => setMatch(null), []);

  const insertMention = useCallback(
    (option: MentionOption) => {
      const el = inputElRef.current;
      if (!el || !match) return;

      const caret = el.selectionStart ?? value.length;
      const before = value.slice(0, match.start);
      const after = value.slice(caret);
      const inserted = `{{${option.value}}} `;

      onChange(`${before}${inserted}${after}`);
      closeMention();

      requestAnimationFrame(() => {
        const pos = before.length + inserted.length;
        el.focus();
        el.setSelectionRange(pos, pos);
      });
    },
    [match, value, onChange, closeMention]
  );

  const handleChange = (event: React.ChangeEvent<InputEl>) => {
    const nextValue = event.target.value;
    onChange(nextValue);

    const caret = event.target.selectionStart ?? nextValue.length;
    setMatch(findMentionMatch(nextValue, caret));
    setActiveIndex(0);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!match || !options.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + options.length) % options.length);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      insertMention(options[activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMention();
    }
  };

  return (
    <>
      <TextField
        {...other}
        fullWidth
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          closeMention();
          onBlur?.(event);
        }}
        inputRef={(el: InputEl | null) => {
          inputElRef.current = el;
        }}
      />

      <Popper
        open={!!match && options.length > 0}
        anchorEl={inputElRef.current}
        placement="bottom-start"
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
      >
        <ClickAwayListener onClickAway={closeMention}>
          <Paper elevation={4} sx={{ mt: 0.5, minWidth: 220 }}>
            <MenuList dense>
              {options.map((option, index) => (
                <MenuItem
                  key={option.value}
                  selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => insertMention(option)}
                >
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
