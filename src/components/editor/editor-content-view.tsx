import type { BoxProps } from '@mui/material/Box';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { sanitizeRichText } from 'src/utils/sanitize-html';

import { editorClasses } from './classes';

// ----------------------------------------------------------------------

export type EditorContentViewProps = BoxProps & {
  content: string;
};

/**
 * Read-only renderer for HTML produced by the `Editor` (Tiptap) component, for places
 * that display saved rich text outside of an editing context (e.g. a details page or PDF
 * preview shouldn't have to re-mount the full editor just to show its output).
 */
export function EditorContentView({ content, className, ...other }: EditorContentViewProps) {
  return (
    <StyledContent
      className={[editorClasses.content.root, className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
      {...other}
    />
  );
}

// ----------------------------------------------------------------------

const StyledContent = styled(Box)(({ theme }) => ({
  '& > * + *': { marginTop: 0, marginBottom: '0.75em' },
  h1: { ...theme.typography.h1, marginTop: 24, marginBottom: 8 },
  h2: { ...theme.typography.h2, marginTop: 24, marginBottom: 8 },
  h3: { ...theme.typography.h3, marginTop: 16, marginBottom: 8 },
  h4: { ...theme.typography.h4, marginTop: 16, marginBottom: 8 },
  h5: { ...theme.typography.h5, marginTop: 16, marginBottom: 8 },
  h6: { ...theme.typography.h6, marginTop: 16, marginBottom: 8 },
  p: { ...theme.typography.body2, margin: 0 },
  [`& .${editorClasses.content.link}`]: { color: theme.vars.palette.primary.main },
  [`& .${editorClasses.content.image}`]: {
    width: '100%',
    height: 'auto',
    maxWidth: '100%',
    margin: 'auto auto 0.75em',
  },
  [`& .${editorClasses.content.mention}`]: {
    padding: '0 4px',
    borderRadius: 4,
    fontWeight: theme.typography.fontWeightSemiBold,
    color: theme.vars.palette.primary.main,
    backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
  },
  [`& .${editorClasses.content.bulletList}`]: { paddingLeft: 20, listStyleType: 'disc', margin: 0 },
  [`& .${editorClasses.content.orderedList}`]: { paddingLeft: 20, margin: 0 },
  [`& .${editorClasses.content.listItem}`]: {
    ...theme.typography.body2,
    '& > p': { margin: 0 },
  },
}));
