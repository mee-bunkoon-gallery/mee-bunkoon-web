'use client';

import type { IJobQueue } from 'src/types/job-queue';

import { useEffect } from 'react';
import { RiEyeFill, RiCalendarEventFill } from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { useJobsQuery } from './job-queue-queries';
import { JOB_QUEUE_STATUS_META } from './job-queue-status';
import { useCompanyProfileQuery } from '../settings/settings-queries';

// ----------------------------------------------------------------------

function JobRow({ job }: { job: IJobQueue }) {
  const statusMeta = JOB_QUEUE_STATUS_META[job.status];
  const time = job.startTime
    ? `${job.startTime.slice(0, 5)}${job.endTime ? ` - ${job.endTime.slice(0, 5)}` : ''}`
    : 'ตลอดวัน';

  return (
    <Card
      component={RouterLink}
      href={paths.dashboard.jobQueue.details(job.id)}
      sx={{
        p: { xs: 2, sm: 2.5 },
        textDecoration: 'none',
        transition: (theme) => theme.transitions.create('transform'),
        '&:hover': { transform: 'translateY(-2px)' },
      }}
    >
      <Box
        sx={{
          gap: 2,
          display: 'flex',
          alignItems: { sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fDate(job.jobDate)} · {time}
          </Typography>
          <Typography variant="h6" noWrap sx={{ mt: 0.25 }}>
            {job.title || 'คิวงาน'}
          </Typography>
          <Typography variant="body2" noWrap sx={{ mt: 0.25, color: 'text.secondary' }}>
            {job.customer?.name || 'ไม่ระบุลูกค้า'}
            {job.location ? ` · ${job.location}` : ''}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Label variant="soft" color={statusMeta.color}>
            {statusMeta.label}
          </Label>
          <RiEyeFill size={18} />
        </Stack>
      </Box>
    </Card>
  );
}

export function JobQueueDisplayView() {
  const { data: jobs = [], isLoading: isJobsLoading, isError: isJobsError } = useJobsQuery();
  const {
    data: company,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
  } = useCompanyProfileQuery();

  useEffect(() => {
    if (isJobsError || isCompanyError) toast.error('โหลดข้อมูลคิวงานไม่สำเร็จ');
  }, [isJobsError, isCompanyError]);

  if (isJobsLoading || isCompanyLoading) return <LoadingScreen />;

  const today = new Date().toISOString().slice(0, 10);
  const upcomingJobs = [...jobs]
    .filter((job) => job.jobDate >= today && job.status !== 'cancelled')
    .sort((a, b) => a.jobDate.localeCompare(b.jobDate));

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: { xs: 2.5, sm: 3.5 },
          mb: 3,
          color: 'common.white',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 2,
          backgroundImage:
            'linear-gradient(90deg, rgba(13, 32, 61, 0.96), rgba(13, 32, 61, 0.58)), url(/assets/background/background-3.webp)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.72 }}>
          {company?.storeNameTh || company?.name || 'มีบุญคุณ แกลเลอรี่'}
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5 }}>
          คิวงาน
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.8 }}>
          ตารางงานที่กำลังจะมาถึง
        </Typography>
      </Box>

      <Box sx={{ gap: 1.5, display: 'grid' }}>
        {upcomingJobs.map((job) => (
          <JobRow key={job.id} job={job} />
        ))}

        {!upcomingJobs.length && (
          <Card sx={{ py: 7, textAlign: 'center' }}>
            <Box component={RiCalendarEventFill} width={44} sx={{ color: 'text.disabled' }} />
            <Typography variant="subtitle1" sx={{ mt: 1.5 }}>
              ยังไม่มีคิวงานที่กำลังจะมาถึง
            </Typography>
          </Card>
        )}
      </Box>

      <Button
        component={RouterLink}
        href={paths.dashboard.jobQueue.root}
        variant="outlined"
        fullWidth
        sx={{ mt: 3 }}
      >
        เปิดปฏิทินคิวงาน
      </Button>
    </DashboardContent>
  );
}
