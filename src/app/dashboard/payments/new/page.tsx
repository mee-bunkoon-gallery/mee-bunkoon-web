import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PaymentCreateView } from 'src/sections/payment/payment-create-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `ออกใบเสร็จรับเงิน - ${CONFIG.appName}` };

export default function Page() {
  return <PaymentCreateView />;
}
