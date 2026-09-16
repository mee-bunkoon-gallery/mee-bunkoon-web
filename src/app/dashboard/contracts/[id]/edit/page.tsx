import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ContractEditView } from 'src/sections/contract/contract-edit-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `แก้ไขสัญญา - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <ContractEditView contractId={id} />;
}
