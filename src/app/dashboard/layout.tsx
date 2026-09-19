import type { NavSectionProps } from 'src/components/nav-section';

import {
  RiGiftFill,
  RiGroupFill,
  RiHome5Fill,
  RiImageFill,
  RiListCheck2,
  RiStore2Fill,
  RiArchiveFill,
  RiPaletteFill,
  RiFileTextFill,
  RiPriceTag3Fill,
  RiSettings3Fill,
  RiCalendarEventFill,
  RiMoneyDollarCircleFill,
} from '@remixicon/react';

import { paths } from 'src/routes/paths';

import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const navData: NavSectionProps['data'] = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'ภาพรวม',
        path: paths.dashboard.root,
        icon: <RiHome5Fill />,
      },
    ],
  },
  {
    subheader: 'การทำงาน',
    items: [
      {
        title: 'ลงคิวงาน',
        path: paths.dashboard.jobQueue.root,
        deepMatch: true,
        icon: <RiCalendarEventFill />,
      },
    ],
  },
  {
    subheader: 'เอกสาร',
    items: [
      {
        title: 'ใบเสนอราคา',
        path: paths.dashboard.quotation.root,
        deepMatch: true,
        icon: <RiFileTextFill />,
      },
      {
        title: 'สัญญาจ้าง',
        path: paths.dashboard.contract.root,
        deepMatch: true,
        icon: <RiFileTextFill />,
      },
      {
        title: 'ใบเสร็จรับเงิน',
        path: paths.dashboard.payment.root,
        deepMatch: true,
        icon: <RiMoneyDollarCircleFill />,
      },
      {
        title: 'เอกสารส่งมอบงาน',
        path: paths.dashboard.delivery.root,
        deepMatch: true,
        icon: <RiArchiveFill />,
      },
    ],
  },

  {
    subheader: 'ข้อมูล',
    items: [
      {
        title: 'ลูกค้า',
        path: paths.dashboard.customer.root,
        icon: <RiGroupFill />,
      },
      {
        title: 'Vendor',
        path: paths.dashboard.vendor.root,
        icon: <RiStore2Fill />,
      },
      {
        title: 'รายการบริการ',
        path: paths.dashboard.service.root,
        deepMatch: true,
        icon: <RiListCheck2 />,
      },
      {
        title: 'แพ็กเกจ/โปรโมชั่น',
        path: paths.dashboard.promotionPackage.root,
        deepMatch: true,
        icon: <RiGiftFill />,
      },
      {
        title: 'แบนเนอร์',
        path: paths.dashboard.heroBanner.root,
        icon: <RiImageFill />,
      },
      {
        title: 'โทนสี',
        path: paths.dashboard.colorTheme.root,
        icon: <RiPaletteFill />,
      },
      {
        title: 'ประเภทงาน',
        path: paths.dashboard.eventType.root,
        icon: <RiPriceTag3Fill />,
      },
    ],
  },
  {
    subheader: 'ตั้งค่า',
    items: [
      {
        title: 'ข้อมูลบริษัทและผู้ประกอบการ',
        path: paths.dashboard.settings.company,
        icon: <RiSettings3Fill />,
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
