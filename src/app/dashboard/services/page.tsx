import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ServiceListView } from 'src/sections/service/service-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `รายการบริการ - ${CONFIG.appName}` };

export default function Page() {
  return <ServiceListView />;
}
