import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PublicJobQueueView } from 'src/sections/job-queue/public-job-queue-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `คิวงาน - ${CONFIG.appName}` };

export default function Page() {
  return <PublicJobQueueView />;
}
