'use client';

import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { useVendorQuery } from './vendor-queries';
import { VendorNewEditForm } from './vendor-new-edit-form';

export function VendorEditView({ vendorId }: { vendorId: string }) {
  const { data: vendor, isLoading } = useVendorQuery(vendorId);
  if (isLoading || !vendor) return <LoadingScreen />;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">แก้ไข Vendor</Typography>
      <Typography variant="body2" sx={{ mt: 1, mb: { xs: 3, md: 5 }, color: 'text.secondary' }}>
        ปรับปรุงข้อมูลติดต่อและเงื่อนไขการว่าจ้าง
      </Typography>
      <VendorNewEditForm currentVendor={vendor} />
    </DashboardContent>
  );
}
