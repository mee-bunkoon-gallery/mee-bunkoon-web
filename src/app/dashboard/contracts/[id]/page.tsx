import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ContractDetailsView } from 'src/sections/contract/contract-details-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `รายละเอียดสัญญา - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <ContractDetailsView contractId={id} />;
}
