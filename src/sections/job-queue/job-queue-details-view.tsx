'use client';

import type { IJobChecklistItem } from 'src/types/job-queue';

import { useState, useEffect } from 'react';
import {
  RiEditLine,
  RiTimeFill,
  RiMapPinLine,
  RiListCheck2,
  RiFileTextFill,
  RiCheckboxCircleFill,
} from '@remixicon/react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fBaht } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { JOB_QUEUE_STATUS_META } from './job-queue-status';
import { usePaymentsQuery } from '../payment/payment-queries';
import { useContractQuery } from '../contract/contract-queries';
import { useDeliveriesQuery } from '../delivery/delivery-queries';
import { useQuotationQuery } from '../quotation/quotation-queries';
import { useJobQuery, useUpdateJobChecklistMutation } from './job-queue-queries';

function JobInfo({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'text.disabled', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1">{value || '-'}</Typography>
    </Box>
  );
}

function DocumentState({
  label,
  ready,
  detail,
  href,
}: {
  label: string;
  ready: boolean;
  detail: string;
  href?: string;
}) {
  const content = (
    <Box sx={{ gap: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
      <Box
        component={ready ? RiCheckboxCircleFill : RiTimeFill}
        sx={{
          width: 20,
          height: 20,
          color: ready ? 'success.main' : 'warning.main',
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {detail}
        </Typography>
      </Box>
    </Box>
  );

  return href ? (
    <Box
      component={RouterLink}
      href={href}
      sx={{ p: 1.5, borderRadius: 1, textDecoration: 'none', bgcolor: 'background.neutral' }}
    >
      {content}
    </Box>
  ) : (
    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}>{content}</Box>
  );
}

type Props = { jobId: string };

type JobChecklistDisplayItem = IJobChecklistItem & { imageUrl?: string | null };

export function JobQueueDetailsView({ jobId }: Props) {
  const router = useRouter();
  const [pendingChecklist, setPendingChecklist] = useState<IJobChecklistItem[] | null>(null);
  const [confirmChecklistOpen, setConfirmChecklistOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  const { data: job, isLoading, isError } = useJobQuery(jobId);

  const documentFilter = job?.quotationId
    ? { quotationId: job.quotationId }
    : job?.contractId
      ? { contractId: job.contractId }
      : undefined;

  const { data: quotation } = useQuotationQuery(job?.quotationId ?? '');
  const { data: contract } = useContractQuery(job?.contractId ?? '');
  const { data: paymentsData } = usePaymentsQuery(documentFilter ?? {});
  const payments = paymentsData ?? [];
  const { data: deliveriesData } = useDeliveriesQuery(documentFilter);
  const deliveries = deliveriesData ?? [];

  const checklistMutation = useUpdateJobChecklistMutation(jobId);

  useEffect(() => {
    if (isError) {
      toast.error('ไม่พบรายละเอียดงานนี้');
      router.replace(paths.dashboard.jobQueue.root);
    }
  }, [isError, router]);

  if (isLoading) return <LoadingScreen />;
  if (!job) return null;

  const statusMeta = JOB_QUEUE_STATUS_META[job.status];
  const timeRange = job.startTime
    ? `${job.startTime.slice(0, 5)}${job.endTime ? ` - ${job.endTime.slice(0, 5)}` : ''}`
    : 'ตลอดวัน';
  const storedChecklist = pendingChecklist ?? job.checklist ?? [];
  const quotationChecklist: JobChecklistDisplayItem[] = quotation
    ? quotation.items.map((item, index) => {
        const id = `quotation-item-${item.id || index}`;
        const savedItem = storedChecklist.find((checklistItem) => checklistItem.id === id);
        return {
          id,
          label: item.description,
          detail: `${item.quantity} ${item.unit || 'รายการ'} · ${fBaht(item.amount)}`,
          imageUrl: item.imageUrl,
          completed: savedItem?.completed ?? false,
        };
      })
    : storedChecklist;
  const completedCount = quotationChecklist.filter((item) => item.completed).length;
  const progress = quotationChecklist.length
    ? (completedCount / quotationChecklist.length) * 100
    : 0;

  const handleChecklistChange = (itemId: string, completed: boolean) => {
    const nextChecklist = quotationChecklist.map((item) =>
      item.id === itemId ? { ...item, completed } : item
    );

    setPendingChecklist(nextChecklist.map(({ imageUrl: _imageUrl, ...item }) => item));
  };

  const handleConfirmChecklist = async () => {
    const checklistToSave = quotationChecklist.map(({ imageUrl: _imageUrl, ...item }) => item);

    try {
      await checklistMutation.mutateAsync(checklistToSave);
      setPendingChecklist(null);
      setConfirmChecklistOpen(false);
      toast.success('ยืนยันรายการงานแล้ว');
    } catch (error) {
      console.error(error);
      toast.error('บันทึกรายการตรวจสอบไม่สำเร็จ');
    }
  };

  const savingChecklist = checklistMutation.isPending;

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          mb: 5,
          gap: 2,
          display: 'flex',
          alignItems: { md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h4">รายละเอียดงาน</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            {job.jobNo}
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          href={paths.dashboard.jobQueue.edit(job.id)}
          variant="contained"
          startIcon={<RiEditLine />}
          sx={{ alignSelf: { xs: 'stretch', md: 'auto' } }}
        >
          แก้ไขงาน
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: 1, p: { xs: 2.5, sm: 3, md: 4 } }}>
            <Box sx={{ mb: 4, gap: 1.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h5">{job.title}</Typography>
              <Label variant="soft" color={statusMeta.color}>
                {statusMeta.label}
              </Label>
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <JobInfo label="ลูกค้า" value={job.customer?.name} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <JobInfo label="วันที่จัดงาน" value={fDate(job.jobDate)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <JobInfo label="เวลา" value={timeRange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <JobInfo label="โทนสี" value={job.colorTheme?.name} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <JobInfo label="สถานที่" value={job.location} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <JobInfo label="จังหวัด" value={job.province} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ color: 'text.disabled', mb: 0.5 }}>
                  ลิงก์สถานที่
                </Typography>
                {job.locationUrl ? (
                  <Link
                    href={job.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ gap: 0.75, display: 'inline-flex', alignItems: 'center' }}
                  >
                    <RiMapPinLine size={18} />
                    เปิดแผนที่
                  </Link>
                ) : (
                  <Typography variant="body1">-</Typography>
                )}
              </Grid>
            </Grid>
            {!!job.jobDescription && (
              <>
                <Divider sx={{ my: 4, borderStyle: 'dashed' }} />
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  รายละเอียดงาน
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                  {job.jobDescription}
                </Typography>
              </>
            )}
            {!!job.note && (
              <>
                <Divider sx={{ my: 4, borderStyle: 'dashed' }} />
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  หมายเหตุ
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                  {job.note}
                </Typography>
              </>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: 1, p: { xs: 2.5, sm: 3, md: 4 } }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h6">สถานะเอกสาร</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                ตรวจสอบเอกสารที่เกี่ยวข้องก่อนเริ่มงาน
              </Typography>
            </Box>
            <Box sx={{ gap: 1.25, display: 'grid' }}>
              <DocumentState
                label="ใบเสนอราคา"
                ready={!!quotation}
                detail={quotation ? quotation.quoteNo : 'ยังไม่ได้ผูกเอกสาร'}
                href={quotation ? paths.dashboard.quotation.details(quotation.id) : undefined}
              />
              <DocumentState
                label="สัญญา"
                ready={!!contract}
                detail={contract ? contract.contractNo : 'ยังไม่ได้ผูกเอกสาร'}
                href={contract ? paths.dashboard.contract.details(contract.id) : undefined}
              />
              <DocumentState
                label="ใบเสร็จรับเงิน"
                ready={payments.length > 0}
                detail={payments.length ? `บันทึกแล้ว ${payments.length} รายการ` : 'ยังไม่มีรายการ'}
                href={payments.length ? paths.dashboard.payment.details(payments[0].id) : undefined}
              />
              <DocumentState
                label="การส่งมอบ"
                ready={deliveries.length > 0}
                detail={
                  deliveries.length ? `บันทึกแล้ว ${deliveries.length} รายการ` : 'ยังไม่มีรายการ'
                }
                href={
                  deliveries.length ? paths.dashboard.delivery.details(deliveries[0].id) : undefined
                }
              />
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
            <Box
              sx={{
                gap: 2,
                mb: 3,
                display: 'flex',
                alignItems: { sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h6">รายการงานจากใบเสนอราคา</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                  ใช้เป็น checklist ให้ทีมงานตรวจงานแต่ละรายการ
                </Typography>
              </Box>
              <Box sx={{ gap: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <Label
                  variant="soft"
                  color={
                    completedCount === quotationChecklist.length && quotationChecklist.length
                      ? 'success'
                      : 'warning'
                  }
                >
                  เสร็จแล้ว {completedCount}/{quotationChecklist.length} รายการ
                </Label>
                <Button
                  variant="contained"
                  disabled={!pendingChecklist || savingChecklist}
                  onClick={() => setConfirmChecklistOpen(true)}
                  startIcon={<RiCheckboxCircleFill />}
                >
                  ยืนยันรายการ
                </Button>
              </Box>
            </Box>
            {quotationChecklist.length ? (
              <>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  color={completedCount === quotationChecklist.length ? 'success' : 'primary'}
                  sx={{ mb: 2.5 }}
                />
                <Box
                  sx={{
                    border: (theme) => `solid 1px ${theme.vars.palette.divider}`,
                    borderRadius: 1.5,
                  }}
                >
                  {quotationChecklist.map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        px: { xs: 1, sm: 1.5 },
                        py: 1.25,
                        gap: 1,
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom:
                          index < quotationChecklist.length - 1
                            ? (theme) => `solid 1px ${theme.vars.palette.divider}`
                            : 'none',
                      }}
                    >
                      <Checkbox
                        checked={item.completed}
                        disabled={savingChecklist}
                        onChange={(event) => handleChecklistChange(item.id, event.target.checked)}
                        inputProps={{ 'aria-label': `ทำรายการ ${item.label} เสร็จแล้ว` }}
                      />
                      <ButtonBase
                        disabled={!item.imageUrl}
                        aria-label={`ดูภาพ ${item.label}`}
                        onClick={() =>
                          item.imageUrl && setPreviewImage({ src: item.imageUrl, alt: item.label })
                        }
                        sx={{
                          borderRadius: 1,
                          overflow: 'hidden',
                          '&:not(.Mui-disabled):hover': { opacity: 0.8 },
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          src={item.imageUrl || '/assets/images/empty/default.png'}
                          alt={item.label}
                          sx={{
                            width: { xs: 58, sm: 76 },
                            height: { xs: 58, sm: 76 },
                            bgcolor: 'background.neutral',
                          }}
                        >
                          <RiListCheck2 size={25} />
                        </Avatar>
                      </ButtonBase>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            textDecoration: item.completed ? 'line-through' : 'none',
                            color: item.completed ? 'text.disabled' : 'text.primary',
                          }}
                        >
                          {item.label}
                        </Typography>
                        {!!item.detail && (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {item.detail}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  py: 5,
                  textAlign: 'center',
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                }}
              >
                <Box component={RiFileTextFill} width={40} sx={{ color: 'text.disabled' }} />
                <Typography variant="subtitle2" sx={{ mt: 1.5 }}>
                  ยังไม่มีรายการจากใบเสนอราคา
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                  ผูกใบเสนอราคากับคิวงานเพื่อให้ทีมงานตรวจรายการได้
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={confirmChecklistOpen}
        onClose={() => !savingChecklist && setConfirmChecklistOpen(false)}
      >
        <DialogTitle>ยืนยันรายการงาน</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ยืนยันว่าทีมงานดำเนินการแล้ว {completedCount} จาก {quotationChecklist.length} รายการ
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            disabled={savingChecklist}
            onClick={() => setConfirmChecklistOpen(false)}
          >
            กลับไปแก้ไข
          </Button>
          <Button variant="contained" loading={savingChecklist} onClick={handleConfirmChecklist}>
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="sm"
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        aria-labelledby="service-image-preview-title"
      >
        <DialogTitle id="service-image-preview-title">{previewImage?.alt}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {previewImage && (
            <Box
              component="img"
              src={previewImage.src}
              alt={previewImage.alt}
              sx={{ width: 1, maxHeight: '70vh', objectFit: 'contain', borderRadius: 1 }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardContent>
  );
}
