import type { BoxProps } from '@mui/material/Box';
import type { ButtonProps } from '@mui/material/Button';

import { RiPlayCircleFill, RiPauseCircleFill } from '@remixicon/react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

export function PlayButton({ sx, isPlaying, ...other }: ButtonProps & { isPlaying: boolean }) {
  return (
    <Button
      size="small"
      color={isPlaying ? 'error' : 'primary'}
      variant="contained"
      startIcon={isPlaying ? <RiPauseCircleFill /> : <RiPlayCircleFill />}
      sx={[
        {
          top: 24,
          right: 24,
          position: 'absolute',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isPlaying ? 'Stop' : 'Play'}
    </Button>
  );
}

// ----------------------------------------------------------------------

export function IndexLabel({ index, sx, ...other }: BoxProps & { index: number }) {
  return (
    <Box
      sx={[
        {
          top: 16,
          left: 16,
          width: 24,
          zIndex: 9,
          height: 24,
          display: 'flex',
          color: 'grey.800',
          borderRadius: '50%',
          position: 'absolute',
          alignItems: 'center',
          bgcolor: 'common.white',
          typography: 'subtitle2',
          justifyContent: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {index}
    </Box>
  );
}
