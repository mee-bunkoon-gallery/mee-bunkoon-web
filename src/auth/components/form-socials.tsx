import type { BoxProps } from '@mui/material/Box';

import { RiGithubFill, RiGoogleFill, RiTwitterXFill } from '@remixicon/react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------

type FormSocialsProps = BoxProps & {
  signInWithGoogle?: () => void;
  singInWithGithub?: () => void;
  signInWithTwitter?: () => void;
};

export function FormSocials({
  sx,
  signInWithGoogle,
  singInWithGithub,
  signInWithTwitter,
  ...other
}: FormSocialsProps) {
  return (
    <Box
      sx={[
        {
          gap: 1.5,
          display: 'flex',
          justifyContent: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <IconButton color="inherit" onClick={signInWithGoogle}>
        <RiGoogleFill size={22} />
      </IconButton>
      <IconButton color="inherit" onClick={singInWithGithub}>
        <RiGithubFill size={22} />
      </IconButton>
      <IconButton color="inherit" onClick={signInWithTwitter}>
        <RiTwitterXFill size={22} />
      </IconButton>
    </Box>
  );
}
