'use client';

import type { IJobQueue } from 'src/types/job-queue';

import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { getJob } from './job-queue-api';
import { JobQueueNewEditForm } from './job-queue-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  jobId: string;
};

export function JobQueueEditView({ jobId }: Props) {
  const router = useRouter();
  const [job, setJob] = useState<IJobQueue | null>(null);

  useEffect(() => {
    getJob(jobId)
      .then(setJob)
      .catch((error) => {
        console.error(error);
        toast.error('ไม่พบคิวงานนี้');
        router.replace(paths.dashboard.jobQueue.root);
      });
  }, [jobId, router]);

  if (!job) return <LoadingScreen />;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        แก้ไขคิวงาน
      </Typography>
      <JobQueueNewEditForm currentJob={job} />
    </DashboardContent>
  );
}
