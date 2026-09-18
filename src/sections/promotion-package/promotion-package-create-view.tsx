'use client';

import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { PromotionPackageNewEditForm } from './promotion-package-new-edit-form';

export function PromotionPackageCreateView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        สร้างแพ็กเกจ/โปรโมชั่น
      </Typography>
      <PromotionPackageNewEditForm />
    </DashboardContent>
  );
}
