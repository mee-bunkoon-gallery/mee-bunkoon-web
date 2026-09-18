import type { LinkProps } from '@mui/material/Link';

import { RiArrowLeftSFill } from '@remixicon/react';

import Link from '@mui/material/Link';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export type BackLinkProps = LinkProps & {
  label?: string;
};

export function BackLink({ sx, label, ...other }: BackLinkProps) {
  return (
    <Link
      component={RouterLink}
      color="inherit"
      underline="none"
      sx={[
        (theme) => ({
          verticalAlign: 'middle',
          '& svg': {
            verticalAlign: 'inherit',
            transform: 'translateY(-2px)',
            ml: {
              xs: '-14px',
              md: '-18px',
            },
            transition: theme.transitions.create(['opacity'], {
              duration: theme.transitions.duration.shorter,
              easing: theme.transitions.easing.sharp,
            }),
          },
          '&:hover': {
            '& svg': {
              opacity: 0.48,
            },
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <RiArrowLeftSFill size={18} />
      {label}
    </Link>
  );
}
