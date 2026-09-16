import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DeliveryDetailsView } from 'src/sections/delivery/delivery-details-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `รายละเอียดเอกสารส่งมอบงาน - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <DeliveryDetailsView deliveryId={id} />;
}
