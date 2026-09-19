import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VendorEditView } from 'src/sections/vendor/vendor-edit-view';

export const metadata: Metadata = { title: `แก้ไข Vendor - ${CONFIG.appName}` };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <VendorEditView vendorId={id} />;
}
