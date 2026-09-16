import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { QuotationDetailsView } from 'src/sections/quotation/quotation-details-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `รายละเอียดใบเสนอราคา - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <QuotationDetailsView quotationId={id} />;
}
