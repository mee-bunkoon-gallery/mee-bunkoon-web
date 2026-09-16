import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { OverviewView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <OverviewView />;
}
