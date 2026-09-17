'use client';

import type { IPayment } from 'src/types/payment';
import type { IContract } from 'src/types/contract';
import type { IJobQueue } from 'src/types/job-queue';
import type { IQuotation } from 'src/types/quotation';

import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fBaht } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

import { useAuthContext } from 'src/auth/hooks';

type DashboardData = {
  jobs: IJobQueue[];
  payments: IPayment[];
  contracts: IContract[];
  quotations: IQuotation[];
};

const EMPTY_DATA: DashboardData = { jobs: [], payments: [], contracts: [], quotations: [] };
const MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

function MetricCard({
  title,
  value,
  caption,
  icon,
  color,
  loading,
}: {
  title: string;
  value: string;
  caption: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'info';
  loading: boolean;
}) {
  const theme = useTheme();
  const mainColor = theme.palette[color].main;

  return (
    <Card
      sx={{
        p: 2.5,
        height: 1,
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={120} height={42} />
          ) : (
            <Typography variant="h4" sx={{ mt: 0.75, letterSpacing: -0.5 }}>
              {value}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 1.75,
            color: mainColor,
            bgcolor: hexAlpha(mainColor, 0.1),
          }}
        >
          <Iconify icon={icon as any} width={23} />
        </Box>
      </Stack>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.5 }}>
        <Iconify icon={'solar:graph-up-bold' as any} width={15} sx={{ color: mainColor }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {caption}
        </Typography>
      </Stack>
    </Card>
  );
}

export function OverviewView() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      ['quotations', 'contracts', 'jobs', 'payments'].map((path) =>
        fetch(`/api/${path}/`, { signal: controller.signal }).then((response) => {
          if (!response.ok) throw new Error(`Unable to load ${path}`);
          return response.json();
        })
      )
    )
      .then(([quotations, contracts, jobs, payments]) =>
        setData({
          jobs: jobs.jobs ?? [],
          payments: payments.payments ?? [],
          contracts: contracts.contracts ?? [],
          quotations: quotations.quotations ?? [],
        })
      )
      .catch((error) => {
        if (error.name !== 'AbortError') setData(EMPTY_DATA);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const today = useMemo(() => new Date(), []);
  const currentMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const totalPaid = data.payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const monthPayments = data.payments.filter((item) => new Date(item.paymentDate) >= currentMonth);
  const monthPaid = monthPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const acceptedSales = data.quotations
    .filter((item) => item.status === 'accepted')
    .reduce((sum, item) => sum + Number(item.total || 0), 0);
  const outstanding = Math.max(acceptedSales - totalPaid, 0);
  const upcomingJobs = data.jobs
    .filter((job) => new Date(`${job.jobDate}T23:59:59`) >= today && job.status !== 'cancelled')
    .sort((a, b) => a.jobDate.localeCompare(b.jobDate))
    .slice(0, 4);
  const currentYear = today.getFullYear();
  const monthlyIncome = MONTHS.map((_, month) =>
    data.payments
      .filter((item) => {
        const date = new Date(item.paymentDate);
        return date.getFullYear() === currentYear && date.getMonth() === month;
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  );

  const chartOptions = useChart({
    colors: [theme.palette.primary.main],
    chart: { toolbar: { show: false } },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    xaxis: { categories: MONTHS },
    yaxis: { labels: { formatter: (value) => `${Math.round(value / 1000)}k` } },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 3 },
    plotOptions: { bar: { borderRadius: 7, columnWidth: '42%' } },
    tooltip: { y: { formatter: (value) => fBaht(value) } },
  });
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'ผู้ใช้งาน';
  const pendingContracts = data.contracts.filter((item) => item.status === 'draft').length;

  return (
    <DashboardContent maxWidth="xl">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="h4">สวัสดี, {displayName} 👋</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            ภาพรวมธุรกิจและรายการที่ต้องติดตามของคุณ
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<Iconify icon="solar:calendar-date-bold" width={17} />}
            label={fDate(today)}
            variant="outlined"
            sx={{ bgcolor: 'background.paper' }}
          />
          <Button
            component={RouterLink}
            href={paths.dashboard.quotation.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            สร้างใบเสนอราคา
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="รายรับทั้งหมด"
            value={fBaht(totalPaid)}
            caption="ยอดรับเงินสะสม"
            icon="solar:wallet-money-bold"
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="รายรับเดือนนี้"
            value={fBaht(monthPaid)}
            caption={`${monthPayments.length} รายการในเดือนนี้`}
            icon="solar:wad-of-money-bold"
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="ยอดค้างชำระ"
            value={fBaht(outstanding)}
            caption="จากใบเสนอราคาที่อนุมัติ"
            icon="solar:bill-list-bold"
            color="warning"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="คิวงานที่กำลังมาถึง"
            value={`${upcomingJobs.length} งาน`}
            caption={`${pendingContracts} สัญญารอลงนาม`}
            icon="solar:calendar-mark-bold"
            color="info"
            loading={loading}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              p: { xs: 2, sm: 3 },
              height: 1,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">ภาพรวมรายรับ</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ยอดรับเงินรายเดือน ปี {currentYear + 543}
                </Typography>
              </Box>
              <Chip
                label={`รวม ${fBaht(monthlyIncome.reduce((sum, value) => sum + value, 0))}`}
                color="success"
                variant="soft"
              />
            </Stack>
            {loading ? (
              <Skeleton variant="rounded" height={300} sx={{ mt: 3 }} />
            ) : (
              <Chart
                type="bar"
                series={[{ name: 'รายรับ', data: monthlyIncome }]}
                options={chartOptions}
                sx={{ height: 310, mt: 1 }}
              />
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{ p: 3, height: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">คิวงานเร็ว ๆ นี้</Typography>
              <IconButton component={RouterLink} href={paths.dashboard.jobQueue.root} size="small">
                <Iconify icon={'solar:arrow-right-up-linear' as any} />
              </IconButton>
            </Stack>
            <Stack spacing={2.25} sx={{ mt: 2.5 }}>
              {loading && [1, 2, 3, 4].map((item) => <Skeleton key={item} height={52} />)}
              {!loading && upcomingJobs.length === 0 && (
                <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                  <Iconify icon={'solar:calendar-minimalistic-bold-duotone' as any} width={48} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    ยังไม่มีคิวงานที่กำลังมาถึง
                  </Typography>
                </Box>
              )}
              {!loading &&
                upcomingJobs.map((job) => (
                  <Stack key={job.id} direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      variant="rounded"
                      sx={{
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        width: 46,
                        height: 46,
                      }}
                    >
                      <Iconify icon="solar:calendar-date-bold" />
                    </Avatar>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {job.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ display: 'block', color: 'text.secondary' }}
                      >
                        {fDate(job.jobDate)} ·{' '}
                        {job.customer?.name || job.location || 'ไม่ระบุสถานที่'}
                      </Typography>
                    </Box>
                    <Chip
                      label={job.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอดำเนินการ'}
                      size="small"
                      color={job.status === 'confirmed' ? 'success' : 'default'}
                      variant="soft"
                    />
                  </Stack>
                ))}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{ p: 3, height: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
          >
            <Typography variant="h6">สถานะงานเอกสาร</Typography>
            <Stack spacing={2.5} sx={{ mt: 3 }}>
              {[
                {
                  label: 'ใบเสนอราคาอนุมัติแล้ว',
                  value: data.quotations.filter((item) => item.status === 'accepted').length,
                  total: data.quotations.length,
                  color: 'success' as const,
                },
                {
                  label: 'สัญญาลงนามแล้ว',
                  value: data.contracts.filter((item) => item.status === 'signed').length,
                  total: data.contracts.length,
                  color: 'primary' as const,
                },
                {
                  label: 'คิวงานเสร็จสิ้น',
                  value: data.jobs.filter((item) => item.status === 'completed').length,
                  total: data.jobs.length,
                  color: 'info' as const,
                },
              ].map((item) => (
                <Box key={item.label}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.value}/{item.total}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={item.total ? (item.value / item.total) * 100 : 0}
                    color={item.color}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ p: 3, pb: 2 }}
            >
              <Box>
                <Typography variant="h6">รายการรับเงินล่าสุด</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  อัปเดตจากข้อมูลการรับชำระเงิน
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                href={paths.dashboard.payment.root}
                color="inherit"
                size="small"
                endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
              >
                ดูทั้งหมด
              </Button>
            </Stack>
            <Divider />
            <Stack divider={<Divider flexItem />}>
              {loading &&
                [1, 2, 3].map((item) => <Skeleton key={item} height={72} sx={{ mx: 3 }} />)}
              {!loading &&
                data.payments.slice(0, 4).map((payment) => (
                  <Stack
                    key={payment.id}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ px: 3, py: 1.75 }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'success.lighter',
                        color: 'success.dark',
                      }}
                    >
                      <Iconify icon={'solar:card-transfer-bold' as any} width={21} />
                    </Avatar>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {payment.customer?.name || payment.receiptNo}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {fDate(payment.paymentDate)} · {payment.receiptNo}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
                        +{fBaht(payment.amount)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        สำเร็จ
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              {!loading && data.payments.length === 0 && (
                <Typography
                  variant="body2"
                  sx={{ py: 7, textAlign: 'center', color: 'text.secondary' }}
                >
                  ยังไม่มีรายการรับเงิน
                </Typography>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
