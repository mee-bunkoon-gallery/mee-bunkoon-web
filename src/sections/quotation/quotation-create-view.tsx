'use client';

import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { QuotationNewEditForm } from './quotation-new-edit-form';

// ----------------------------------------------------------------------

export function QuotationCreateView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        สร้างใบเสนอราคา
      </Typography>

      <QuotationNewEditForm />
    </DashboardContent>
  );
}
