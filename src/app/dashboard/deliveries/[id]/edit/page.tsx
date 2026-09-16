import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DeliveryEditView } from 'src/sections/delivery/delivery-edit-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `แก้ไขเอกสารส่งมอบงาน - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <DeliveryEditView deliveryId={id} />;
}
