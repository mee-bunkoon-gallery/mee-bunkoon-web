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
      <Typography variant="h4">ลงคิวงานใหม่</Typography>
      <Typography variant="body2" sx={{ mt: 1, mb: { xs: 3, md: 5 }, color: 'text.secondary' }}>
        บันทึกรายละเอียดลูกค้า กำหนดการ และข้อมูลที่ทีมงานต้องใช้
      </Typography>
      <JobQueueNewEditForm
        defaultDate={searchParams.get('date')}
        initialQuotationId={searchParams.get('quotationId')}
        initialContractId={searchParams.get('contractId')}
      />
    </DashboardContent>
  );
}
