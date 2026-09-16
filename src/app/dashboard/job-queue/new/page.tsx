import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { JobQueueCreateView } from 'src/sections/job-queue/job-queue-create-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `ลงคิวงานใหม่ - ${CONFIG.appName}` };

export default function Page() {
  return <JobQueueCreateView />;
}
