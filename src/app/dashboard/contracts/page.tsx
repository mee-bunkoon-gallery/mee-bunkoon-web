import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ContractListView } from 'src/sections/contract/contract-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `สัญญาจ้างจัดงาน - ${CONFIG.appName}` };

export default function Page() {
  return <ContractListView />;
}
