import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DeliveryListView } from 'src/sections/delivery/delivery-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `เอกสารส่งมอบงาน - ${CONFIG.appName}` };

export default function Page() {
  return <DeliveryListView />;
}
