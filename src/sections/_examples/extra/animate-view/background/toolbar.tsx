import type { BoxProps } from '@mui/material/Box';

import { RiStarFill } from '@remixicon/react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------

type ToolbarProps = BoxProps & {
  onRefresh: () => void;
};

export function Toolbar({ onRefresh, sx, ...other }: ToolbarProps) {
  return (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <IconButton onClick={onRefresh}>
        <RiStarFill />
      </IconButton>
    </Box>
  );
}
