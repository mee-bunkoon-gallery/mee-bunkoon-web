import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VendorCreateView } from 'src/sections/vendor/vendor-create-view';

export const metadata: Metadata = { title: `เพิ่ม Vendor - ${CONFIG.appName}` };

export default function Page() {
  return <VendorCreateView />;
}
