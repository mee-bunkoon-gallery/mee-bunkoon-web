import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CompanyProfileView } from 'src/sections/settings/company-profile-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `ตั้งค่าข้อมูลผู้เสนอราคา - ${CONFIG.appName}` };

export default function Page() {
  return <CompanyProfileView />;
}
