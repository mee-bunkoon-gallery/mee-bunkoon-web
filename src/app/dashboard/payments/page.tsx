import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PaymentListView } from 'src/sections/payment/payment-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `ใบเสร็จรับเงิน - ${CONFIG.appName}` };

export default function Page() {
  return <PaymentListView />;
}
