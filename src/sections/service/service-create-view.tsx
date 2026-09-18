'use client';

import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { ServiceNewEditForm } from './service-new-edit-form';

export function ServiceCreateView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        เพิ่มรายการบริการ
      </Typography>
      <ServiceNewEditForm />
    </DashboardContent>
  );
}
