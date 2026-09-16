import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { DashboardLayout } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const navData: NavSectionProps['data'] = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: <Iconify icon="solar:home-angle-bold-duotone" />,
      },
    ],
  },
  {
    subheader: 'การทำงาน',
    items: [
      {
        title: 'ลงคิวงาน',
        path: paths.dashboard.jobQueue.root,
        icon: <Iconify icon="solar:calendar-date-bold" />,
      },
    ],
  },
  {
    subheader: 'เอกสาร',
    items: [
      {
        title: 'ใบเสนอราคา',
        path: paths.dashboard.quotation.root,
        icon: <Iconify icon="solar:file-text-bold" />,
      },
      {
        title: 'สัญญาจ้างจัดงาน',
        path: paths.dashboard.contract.root,
        icon: <Iconify icon="solar:file-check-bold-duotone" />,
      },
      {
        title: 'ใบเสร็จรับเงิน',
        path: paths.dashboard.payment.root,
        icon: <Iconify icon="solar:wad-of-money-bold" />,
      },
      {
        title: 'เอกสารส่งมอบงาน',
        path: paths.dashboard.delivery.root,
        icon: <Iconify icon="solar:inbox-in-bold-duotone" />,
      },
    ],
  },

  {
    subheader: 'ข้อมูล',
    items: [
      {
        title: 'ลูกค้า',
        path: paths.dashboard.customer.root,
        icon: <Iconify icon="solar:users-group-rounded-bold-duotone" />,
      },
      {
        title: 'รายการบริการ',
        path: paths.dashboard.service.root,
        icon: <Iconify icon="solar:box-minimalistic-bold" />,
      },
      {
        title: 'โทนสี',
        path: paths.dashboard.colorTheme.root,
        icon: <Iconify icon="solar:pallete-2-bold-duotone" />,
      },
    ],
  },
  {
    subheader: 'ตั้งค่า',
    items: [
      {
        title: 'ข้อมูลผู้เสนอราคา',
        path: paths.dashboard.settings.company,
        icon: <Iconify icon="solar:settings-bold-duotone" />,
      },
    ],
  },
];

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <AuthGuard>
      <DashboardLayout slotProps={{ nav: { data: navData } }}>{children}</DashboardLayout>
    </AuthGuard>
  );
}
