import type { LinkProps } from '@mui/material/Link';

import { RiArrowLeftSFill } from '@remixicon/react';

import Link from '@mui/material/Link';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

type FormReturnLinkProps = LinkProps & {
  href: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
};

export function FormReturnLink({ sx, href, label, icon, children, ...other }: FormReturnLinkProps) {
  return (
    <Link
      component={RouterLink}
      href={href}
      color="inherit"
      variant="subtitle2"
      sx={[
        {
          mt: 3,
          gap: 0.5,
          mx: 'auto',
          alignItems: 'center',
          display: 'inline-flex',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {icon || <RiArrowLeftSFill size={16} />}
      {label || 'Return to sign in'}
      {children}
    </Link>
  );
}
