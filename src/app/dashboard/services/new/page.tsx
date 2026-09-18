import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ServiceCreateView } from 'src/sections/service/service-create-view';

export const metadata: Metadata = { title: `เพิ่มรายการบริการ - ${CONFIG.appName}` };

export default function Page() {
  return <ServiceCreateView />;
}
