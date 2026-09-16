import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CustomerListView } from 'src/sections/customer/customer-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `ลูกค้า - ${CONFIG.appName}` };

export default function Page() {
  return <CustomerListView />;
}
