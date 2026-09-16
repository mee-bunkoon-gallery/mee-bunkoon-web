import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { QuotationEditView } from 'src/sections/quotation/quotation-edit-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `แก้ไขใบเสนอราคา - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <QuotationEditView quotationId={id} />;
}
