'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useBoolean } from 'minimal-shared/hooks';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { Box, Stack } from '@mui/material';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fBaht } from 'src/utils/format-number';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

import { usePaymentQuery } from './payment-queries';
import { PaymentPdfDocument } from './payment-pdf-document';
import { useQuotationQuery } from '../quotation/quotation-queries';
import { useCompanyProfileQuery } from '../settings/settings-queries';
import { PAYMENT_METHOD_LABEL, PAYMENT_PURPOSE_LABEL } from './payment-method';

// ----------------------------------------------------------------------

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <Button variant="contained">กำลังเตรียมไฟล์...</Button> }
);

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

type Props = {
  paymentId: string;
};

export function PaymentDetailsView({ paymentId }: Props) {
  const router = useRouter();

  const previewDialog = useBoolean();

  const { data: companyProfile } = useCompanyProfileQuery();

  const {
    data: payment,
    isLoading,
    isError,
  } = usePaymentQuery(paymentId);

  const { data: quotation } = useQuotationQuery(payment?.quotationId ?? '');

  useEffect(() => {
    if (isError) {
      toast.error('ไม่พบใบเสร็จรับเงินนี้');
      router.replace(paths.dashboard.payment.root);
    }
  }, [isError, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!payment) {
    return null;
  }

  const isSlipImage = payment.slipUrl && !payment.slipUrl.split('?')[0].endsWith('.pdf');

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          mb: 5,
          gap: 2,
          display: 'flex',
          alignItems: { sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4">{payment.receiptNo}</Typography>

        <Box sx={{ gap: 1.5, display: 'flex' }}>
          <Button
            component={RouterLink}
            href={paths.dashboard.payment.edit(payment.id)}
            variant="outlined"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            แก้ไข
          </Button>

          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:eye-bold" />}
            onClick={previewDialog.onTrue}
          >
            พรีวิวใบเสร็จรับเงิน
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              {!!companyProfile?.logoUrl && (
                <Avatar
                  src={companyProfile.logoUrl}
                  variant="rounded"
                  sx={{ width: 100, height: 100 }}
                />
              )}
              <Stack>
                <Typography variant="h3">
                  {companyProfile?.storeNameTh || companyProfile?.name || CONFIG.appName}
                </Typography>
                <Typography variant="body1">
                  {companyProfile?.storeNameEn || companyProfile?.name || CONFIG.appName}
                </Typography>
                <Typography variant="body1">
                  {companyProfile?.entityType === 'individual' ? 'ในนามบุคคล' : 'ในนามบริษัท'}
                </Typography>
              </Stack>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.disabled' }}>
                  ได้รับเงินจาก
                </Typography>
                <Typography variant="subtitle1">{payment.customer?.name}</Typography>
                {payment.customer?.phone && (
                  <Typography variant="body2">โทร: {payment.customer.phone}</Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    วันที่รับเงิน
                  </Typography>
                  <Typography variant="body2">{fDate(payment.paymentDate)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    ประเภทการรับเงิน
                  </Typography>
                  <Typography variant="body2">
                    {PAYMENT_PURPOSE_LABEL[payment.paymentPurpose]}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    ช่องทาง
                  </Typography>
                  <Typography variant="body2">
                    {PAYMENT_METHOD_LABEL[payment.paymentMethod]}
                  </Typography>
                </Box>
                {payment.referenceNo && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      เลขที่อ้างอิง
                    </Typography>
                    <Typography variant="body2">{payment.referenceNo}</Typography>
                  </Box>
                )}
                {payment.quotation && (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      อ้างอิงใบเสนอราคา
                    </Typography>
                    <Button
                      component={RouterLink}
                      href={paths.dashboard.quotation.details(payment.quotation.id)}
                      size="small"
                      variant="text"
                      endIcon={<Iconify icon="solar:eye-bold" />}
                    >
                      {payment.quotation.quoteNo}
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Box
              sx={{
                p: 2.5,
                borderRadius: 1,
                textAlign: 'center',
                border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                จำนวนเงินที่ได้รับ
              </Typography>
              <Typography variant="h3" sx={{ mt: 0.5 }}>
                {fBaht(payment.amount)}
              </Typography>
            </Box>

            {payment.note && (
              <>
                <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  หมายเหตุ
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {payment.note}
                </Typography>
              </>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              หลักฐานการโอนเงิน
            </Typography>

            {!payment.slipUrl && (
              <Box
                sx={{
                  py: 6,
                  textAlign: 'center',
                  color: 'text.disabled',
                  border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">ยังไม่มีไฟล์แนบ</Typography>
              </Box>
            )}

            {payment.slipUrl && isSlipImage && (
              <Box
                component="img"
                src={payment.slipUrl}
                alt="หลักฐานการโอนเงิน"
                sx={{
                  width: 1,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                }}
              />
            )}

            {payment.slipUrl && !isSlipImage && (
              <Link href={payment.slipUrl} target="_blank" rel="noopener">
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Iconify icon="solar:file-bold-duotone" />}
                >
                  เปิดไฟล์หลักฐาน (PDF)
                </Button>
              </Link>
            )}
          </Card>
        </Grid>
      </Grid>

      <Dialog
        fullWidth
        maxWidth="md"
        open={previewDialog.value}
        onClose={previewDialog.onFalse}
        slotProps={{ paper: { sx: { height: '90vh' } } }}
      >
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}
        >
          พรีวิวใบเสร็จรับเงิน — {payment.receiptNo}
          <IconButton onClick={previewDialog.onFalse}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
            <PaymentPdfDocument
              payment={payment}
              quotation={quotation}
              companyProfile={companyProfile}
              companyName={CONFIG.appName}
            />
          </PDFViewer>
        </DialogContent>

        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <PDFDownloadLink
            document={
              <PaymentPdfDocument
                payment={payment}
                quotation={quotation}
                companyProfile={companyProfile}
                companyName={CONFIG.appName}
              />
            }
            fileName={`${payment.receiptNo}.pdf`}
          >
            <Button variant="contained" startIcon={<Iconify icon="eva:cloud-download-fill" />}>
              ดาวน์โหลด PDF
            </Button>
          </PDFDownloadLink>
        </Box>
      </Dialog>
    </DashboardContent>
  );
}
