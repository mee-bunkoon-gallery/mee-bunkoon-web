import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { VendorNewEditForm } from './vendor-new-edit-form';

export function VendorCreateView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">เพิ่ม Vendor</Typography>
      <Typography variant="body2" sx={{ mt: 1, mb: { xs: 3, md: 5 }, color: 'text.secondary' }}>
        เพิ่มข้อมูลผู้รับจ้างหรือซัพพลายเออร์สำหรับใช้ในงาน
      </Typography>
      <VendorNewEditForm />
    </DashboardContent>
  );
}
