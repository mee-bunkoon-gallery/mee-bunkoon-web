import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PaymentDetailsView } from 'src/sections/payment/payment-details-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `รายละเอียดใบเสร็จรับเงิน - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <PaymentDetailsView paymentId={id} />;
}
