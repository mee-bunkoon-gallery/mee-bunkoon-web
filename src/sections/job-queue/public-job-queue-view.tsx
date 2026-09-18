'use client';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

import { JOB_QUEUE_STATUS_META } from './job-queue-status';

// ----------------------------------------------------------------------

type PublicJob = {
  id: string;
  jobNo: string;
  title: string;
  jobDate: string;
  startTime: string | null;
  endTime: string | null;
  status: keyof typeof JOB_QUEUE_STATUS_META;
};

type PublicJobResponse = {
  company: { name: string; nameEn: string | null; logoUrl: string | null } | null;
  jobs: PublicJob[];
};

/**
 * This page is public and unauthenticated — it hits `/api/public/jobs/` directly
 * rather than going through `job-queue-api.ts` (which is gated by `apiFetch`'s auth).
 * There's no shared query-hook file for this one-off public endpoint, so it's wrapped
 * in a local inline query here instead.
 */
async function fetchPublicJobs(): Promise<PublicJobResponse> {
  try {
    const response = await fetch('/api/public/jobs/', { cache: 'no-store' });
    const payload = await response.json();

    if (!response.ok) throw new Error(payload.message || 'ไม่สามารถโหลดคิวงานได้');

    return payload;
  } catch (error) {
    console.error(error);
    return { company: null, jobs: [] };
  }
}

export function PublicJobQueueView() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-jobs'],
    queryFn: fetchPublicJobs,
  });

  if (isLoading) return <LoadingScreen />;

  const jobCount = data?.jobs.length ?? 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: { xs: 2, sm: 3, md: 8 },
        pt: { xs: 11, sm: 13, md: 14 },
        pb: { xs: 8, md: 12 },
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ mx: 'auto', maxWidth: 1280 }}>
        <Box
          sx={{
            px: { xs: 3, md: 6 },
            py: { xs: 5, md: 6 },
            mb: { xs: 2.5, sm: 4 },
            color: 'common.white',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: { xs: 2.5, sm: 3 },
            boxShadow: '0 24px 54px rgba(255, 255, 255, 0.93)',
            backgroundImage:
              'linear-gradient(105deg, rgba(249, 245, 239, 0.98), rgba(255, 253, 247, 0.78)), url(/assets/background/hero-3.jpg)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <Box
            sx={{
              width: 240,
              height: 240,
              right: -80,
              bottom: -150,
              position: 'absolute',
              borderRadius: '50%',
              border: '38px solid rgba(255,255,255,0.07)',
            }}
          />
          <Box
            sx={{
              gap: 2,
              zIndex: 1,
              display: 'flex',
              position: 'relative',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ gap: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ zIndex: 1, maxWidth: 760, position: 'relative' }}>
                <Typography variant="overline" color="secondary" sx={{ letterSpacing: 2 }}>
                  UPCOMING EVENTS
                </Typography>
                <Typography variant="h2" color="primary" sx={{ mt: 1 }}>
                  คิวงานที่กำลังจะมาถึง
                </Typography>
                <Typography color="primary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
                  ติดตามกำหนดการและสถานะงานได้ที่นี่
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                minWidth: { sm: 102 },
                py: 1.25,
                px: { xs: 1.25, sm: 2 },
                display: 'flex',
                borderRadius: 1.5,
                textAlign: 'center',
                alignItems: 'center',
                flexDirection: { xs: 'row', sm: 'column' },
                gap: { xs: 1, sm: 0 },
                bgcolor: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
              }}
            >
              <Typography sx={{ fontSize: { xs: 24, sm: 30 }, fontWeight: 800, lineHeight: 1 }}>
                {jobCount}
              </Typography>
              <Typography
                variant="caption"
                sx={{ mt: { sm: 0.5 }, opacity: 0.78, whiteSpace: 'nowrap' }}
              >
                คิวงานทั้งหมด
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h4" sx={{ fontSize: { xs: 24, sm: 28 } }}>
            ตารางคิวงาน
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            กำหนดการเรียงตามวันที่เพื่อให้ตรวจสอบคิวได้สะดวก
          </Typography>
        </Box>

        <Box sx={{ gap: 2, display: 'grid' }}>
          {data?.jobs.map((job) => {
            const statusMeta = JOB_QUEUE_STATUS_META[job.status];
            const time = job.startTime
              ? `${job.startTime.slice(0, 5)}${job.endTime ? ` - ${job.endTime.slice(0, 5)}` : ''}`
              : 'ตลอดวัน';

            return (
              <Card
                key={job.id}
                sx={{
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: { sm: `4px solid ${statusMeta.hex}` },
                  boxShadow: '0 10px 28px rgba(13, 32, 61, 0.06)',
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    transform: { sm: 'translateY(-2px)' },
                    boxShadow: '0 16px 34px rgba(5, 37, 24, 0.12)',
                  },
                }}
              >
                <Box
                  sx={{
                    minHeight: { sm: 126 },
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '180px minmax(0, 1fr) auto' },
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2.5 },
                      color: { xs: 'common.white', sm: statusMeta.hex },
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: { xs: statusMeta.hex, sm: 'transparent' },
                      justifyContent: { xs: 'flex-start', sm: 'center' },
                    }}
                  >
                    <Box
                      sx={{
                        gap: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: { sm: 'column' },
                      }}
                    >
                      <Iconify icon="solar:calendar-date-bold" width={26} />
                      <Typography variant="subtitle2" sx={{ textAlign: { sm: 'center' } }}>
                        {fDate(job.jobDate)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: { xs: 2, sm: 2.75 }, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {job.jobNo}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.25, overflowWrap: 'anywhere' }}>
                      {job.title}
                    </Typography>
                    <Box
                      sx={{
                        gap: 0.75,
                        mt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      <Iconify icon="solar:clock-circle-outline" width={18} />
                      <Typography variant="body2">{time}</Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      px: { xs: 2, sm: 2.75 },
                      pb: { xs: 2, sm: 0 },
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Label variant="soft" color={statusMeta.color} sx={{ px: 1.25, py: 0.65 }}>
                      {statusMeta.label}
                    </Label>
                  </Box>
                </Box>
              </Card>
            );
          })}

          {!data?.jobs.length && (
            <Card
              sx={{
                py: { xs: 7, sm: 9 },
                textAlign: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                boxShadow: 'none',
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  display: 'grid',
                  borderRadius: '50%',
                  placeItems: 'center',
                  bgcolor: 'background.neutral',
                }}
              >
                <Iconify
                  icon="solar:calendar-date-bold"
                  width={32}
                  sx={{ color: 'text.disabled' }}
                />
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                ยังไม่มีคิวงานที่กำลังจะมาถึง
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                โปรดติดตามตารางงานใหม่อีกครั้ง
              </Typography>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}
