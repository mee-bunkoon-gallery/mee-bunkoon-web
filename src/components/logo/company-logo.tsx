'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import { useState, useEffect } from 'react';

import { Logo } from './logo';

// ----------------------------------------------------------------------

type CompanyLogoProps = {
  sx?: SxProps<Theme>;
};

export function CompanyLogo({ sx }: CompanyLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch('/api/public/company/', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (mounted) setLogoUrl(payload?.company?.logoUrl ?? null);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  if (logoUrl) return <Logo sx={sx} />;

  // return (
  //   <Box
  //     component="img"
  //     src={logoUrl}
  //     alt="โลโก้บริษัท"
  //     sx={[
  //       { width: 40, height: 40, objectFit: 'contain', flexShrink: 0 },
  //       ...(Array.isArray(sx) ? sx : [sx]),
  //     ]}
  //   />
  // );
}
