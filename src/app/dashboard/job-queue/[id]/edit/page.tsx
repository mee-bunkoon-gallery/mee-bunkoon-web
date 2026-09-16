import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { JobQueueEditView } from 'src/sections/job-queue/job-queue-edit-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `แก้ไขคิวงาน - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <JobQueueEditView jobId={id} />;
}
