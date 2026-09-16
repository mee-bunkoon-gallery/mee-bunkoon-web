import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { JobQueueCalendarView } from 'src/sections/job-queue/job-queue-calendar-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `ลงคิวงาน - ${CONFIG.appName}` };

export default function Page() {
  return <JobQueueCalendarView />;
}
