import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { QuotationCreateView } from 'src/sections/quotation/quotation-create-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `สร้างใบเสนอราคา - ${CONFIG.appName}` };

export default function Page() {
  return <QuotationCreateView />;
}
