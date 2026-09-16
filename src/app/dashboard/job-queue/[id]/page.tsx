import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { JobQueueDetailsView } from 'src/sections/job-queue/job-queue-details-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `รายละเอียดงาน - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <JobQueueDetailsView jobId={id} />;
}
