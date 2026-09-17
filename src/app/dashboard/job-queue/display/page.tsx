import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { JobQueueDisplayView } from 'src/sections/job-queue/job-queue-display-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `คิวงาน - ${CONFIG.appName}` };

export default function Page() {
  return <JobQueueDisplayView />;
}
