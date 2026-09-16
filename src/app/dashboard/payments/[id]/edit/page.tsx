import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PaymentEditView } from 'src/sections/payment/payment-edit-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `แก้ไขใบเสร็จรับเงิน - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <PaymentEditView paymentId={id} />;
}
