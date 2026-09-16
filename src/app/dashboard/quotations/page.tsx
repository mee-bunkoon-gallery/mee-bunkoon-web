import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { QuotationListView } from 'src/sections/quotation/quotation-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `ใบเสนอราคา - ${CONFIG.appName}` };

export default function Page() {
  return <QuotationListView />;
}
