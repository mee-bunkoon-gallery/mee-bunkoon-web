'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { Logo } from './logo';

// ----------------------------------------------------------------------

type CompanyLogoProps = {
  sx?: SxProps<Theme>;
  isRow?: boolean;
};

export function CompanyLogo({ sx, isRow }: CompanyLogoProps) {
  const [companyName, setCompanyName] = useState('มีบุญคุณ แกลเลอรี่');
  const [companyNameEn, setCompanyNameEn] = useState('MEE BUNKOON GALLERY');

  useEffect(() => {
    let mounted = true;

    fetch('/api/public/company/', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (mounted && payload?.company) {
          setCompanyName(payload.company.name || 'มีบุญคุณ แกลเลอรี่');
          setCompanyNameEn(payload.company.nameEn || 'MEE BUNKOON GALLERY');
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Stack
      direction={isRow ? 'row' : 'column'}
      spacing={1.5}
      alignItems="center"
      justifyContent="center"
    >
      <Logo sx={sx} />
      <Box
        component={RouterLink}
        href="/"
        sx={{ color: 'inherit', textDecoration: 'none', lineHeight: 1.1 }}
      >
        <Typography sx={{ fontSize: { xs: 13, sm: 15 }, fontWeight: 800, lineHeight: 1.2 }}>
          {companyName}
        </Typography>
        <Typography
          sx={{
            mt: 0.25,
            display: { xs: 'none', sm: 'block' },
            color: 'inherit',
            opacity: 0.64,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 0.7,
            lineHeight: 1.2,
          }}
        >
          {companyNameEn}
        </Typography>
      </Box>
    </Stack>
  );
}
