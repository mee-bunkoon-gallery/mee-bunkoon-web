'use client';

import Typography from '@mui/material/Typography';

import { useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { JobQueueNewEditForm } from './job-queue-new-edit-form';

// ----------------------------------------------------------------------

export function JobQueueCreateView() {
  const searchParams = useSearchParams();

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        ลงคิวงานใหม่
      </Typography>
      <JobQueueNewEditForm
        defaultDate={searchParams.get('date')}
        initialQuotationId={searchParams.get('quotationId')}
        initialContractId={searchParams.get('contractId')}
      />
    </DashboardContent>
  );
}
