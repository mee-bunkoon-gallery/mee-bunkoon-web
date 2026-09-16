import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ContractCreateView } from 'src/sections/contract/contract-create-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `สร้างสัญญาจ้างจัดงาน - ${CONFIG.appName}` };

export default function Page() {
  return <ContractCreateView />;
}
