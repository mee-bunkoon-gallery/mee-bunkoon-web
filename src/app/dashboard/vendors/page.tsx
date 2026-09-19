import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VendorListView } from 'src/sections/vendor/vendor-list-view';

export const metadata: Metadata = { title: `Vendor - ${CONFIG.appName}` };

export default function Page() {
  return <VendorListView />;
}
