import type { IconButtonProps } from '@mui/material/IconButton';

import { RiMenu2Line } from '@remixicon/react';

import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------

export function MenuButton({
  sx,
  'aria-label': ariaLabel = 'เปิดเมนู',
  ...other
}: IconButtonProps) {
  return (
    <IconButton
      aria-label={ariaLabel}
      sx={[
        (theme) => ({
          width: 40,
          height: 40,
          flexShrink: 0,
          color: 'inherit',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'transparent',
          transition: theme.transitions.create(['color', 'background-color', 'border-color']),
          '&:hover': {
            color: 'primary.main',
            bgcolor: 'action.hover',
            borderColor: 'divider',
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <RiMenu2Line size={24} aria-hidden="true" />
    </IconButton>
  );
}
