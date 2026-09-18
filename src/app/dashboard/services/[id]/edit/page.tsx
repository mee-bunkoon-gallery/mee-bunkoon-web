import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ServiceEditView } from 'src/sections/service/service-edit-view';

export const metadata: Metadata = { title: `แก้ไขรายการบริการ - ${CONFIG.appName}` };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ServiceEditView serviceItemId={id} />;
}
