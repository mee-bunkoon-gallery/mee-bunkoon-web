import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DeliveryCreateView } from 'src/sections/delivery/delivery-create-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `สร้างเอกสารส่งมอบงาน - ${CONFIG.appName}` };

export default function Page() {
  return <DeliveryCreateView />;
}
