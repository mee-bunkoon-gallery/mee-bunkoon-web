'use client';

import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { HeroBannerNewEditForm } from './hero-banner-new-edit-form';

export function HeroBannerCreateView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        เพิ่มแบนเนอร์
      </Typography>
      <HeroBannerNewEditForm />
    </DashboardContent>
  );
}
