'use client';

import type { IPayment } from 'src/types/payment';
import type { IQuotation } from 'src/types/quotation';
import type { ICompanyProfile } from 'src/types/settings';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { Box, Stack } from '@mui/material';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fBaht } from 'src/utils/format-number';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { getQuotation } from './quotation-api';
import { getPayments } from '../payment/payment-api';
import { QUOTATION_STATUS_META } from './quotation-status';
import { getCompanyProfile } from '../settings/settings-api';
import { QuotationPdfDocument } from './quotation-pdf-document';
import { PAYMENT_METHOD_LABEL } from '../payment/payment-method';
import { QuotationSignatureDialog } from './quotation-signature-dialog';

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
  quotationId: string;
};

export function QuotationDetailsView({ quotationId }: Props) {
  const router = useRouter();

  const [quotation, setQuotation] = useState<IQuotation | null>(null);
  const [companyProfile, setCompanyProfile] = useState<ICompanyProfile | null>(null);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [signatureSigner, setSignatureSigner] = useState<'issuer' | 'customer' | null>(null);

  const previewDialog = useBoolean();

  useEffect(() => {
    getCompanyProfile()
      .then(setCompanyProfile)
      .catch(() => {});

    getPayments({ quotationId })
      .then(setPayments)
      .catch(() => {});

    getQuotation(quotationId)
      .then(setQuotation)
      .catch((error) => {
        console.error(error);
        toast.error('ไม่พบใบเสนอราคานี้');
        router.replace(paths.dashboard.quotation.root);
      })
      .finally(() => setLoading(false));
  }, [quotationId, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!quotation) {
    return null;
  }

  const statusMeta = QUOTATION_STATUS_META[quotation.status];

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'contents' }}>
        <Box
          sx={{
            mb: 5,
            gap: 2,
            display: 'flex',
            alignItems: { lg: 'center' },
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h4">{quotation.quoteNo}</Typography>
            <Label variant="soft" color={statusMeta.color} sx={{ mt: 1 }}>
              {statusMeta.label}
            </Label>
          </Box>

          <Box
            sx={{
              gap: 1,
              display: 'flex',
              width: { xs: 1, lg: 'auto' },
              flexWrap: 'wrap',
              justifyContent: { lg: 'flex-end' },
              '& .MuiButton-root': { flex: { xs: '1 1 calc(50% - 4px)', sm: '0 1 auto' } },
            }}
          >
            <Button
              component={RouterLink}
              href={paths.dashboard.quotation.edit(quotation.id)}
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              แก้ไข
            </Button>

            <Button
              component={RouterLink}
              href={`${paths.dashboard.contract.new}?quotationId=${quotation.id}`}
              variant="outlined"
              startIcon={<Iconify icon="solar:file-check-bold-duotone" />}
            >
              สร้างสัญญา
            </Button>

            <Button
              component={RouterLink}
              href={`${paths.dashboard.payment.new}?quotationId=${quotation.id}`}
              variant="outlined"
              startIcon={<Iconify icon="solar:wad-of-money-bold" />}
            >
              ออกใบเสร็จรับเงิน
            </Button>

            <Button
              component={RouterLink}
              href={`${paths.dashboard.delivery.new}?quotationId=${quotation.id}`}
              variant="outlined"
              startIcon={<Iconify icon="solar:inbox-in-bold-duotone" />}
            >
              ส่งมอบงาน
            </Button>

            <Button
              component={RouterLink}
              href={`${paths.dashboard.jobQueue.new}?quotationId=${quotation.id}`}
              variant="outlined"
              startIcon={<Iconify icon="solar:calendar-date-bold" />}
            >
              ลงคิวงาน
            </Button>

            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:eye-bold" />}
              onClick={previewDialog.onTrue}
            >
              พรีวิว PDF
            </Button>
          </Box>
        </Box>

        <Card sx={{ p: { xs: 2, sm: 3, md: 5 } }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  gap: 2,
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: { xs: 'column', sm: 'row' },
                  textAlign: { xs: 'center', sm: 'left' },
                }}
              >
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
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'space-between', md: 'flex-end' },
                  mb: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  วันที่ออกใบเสนอราคา
                </Typography>
                <Typography variant="body2" pl={2}>
                  {fDate(quotation.issueDate)}
                </Typography>
              </Box>
              {quotation.validUntil && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    ยืนราคาถึงวันที่
                  </Typography>
                  <Typography variant="body2">{fDate(quotation.validUntil)}</Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.disabled' }}>
                จาก
              </Typography>
              <Typography variant="subtitle1">
                {companyProfile?.entityType === 'individual'
                  ? companyProfile?.name
                  : companyProfile?.storeNameTh || CONFIG.appName}
              </Typography>
              {companyProfile?.branch && (
                <Typography variant="body2">สาขา: {companyProfile.branch}</Typography>
              )}
              <Stack
                sx={{
                  gap: 0.5,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {companyProfile?.phone && (
                  <Typography variant="body2">โทร: {companyProfile.phone} </Typography>
                )}
                {companyProfile?.email && (
                  <Typography variant="body2">อีเมล: {companyProfile.email}</Typography>
                )}
              </Stack>
              {companyProfile?.address && (
                <Typography variant="body2">ที่อยู่: {companyProfile.address}</Typography>
              )}
              {companyProfile?.taxId && (
                <Typography variant="body2">เลขผู้เสียภาษี: {companyProfile.taxId}</Typography>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.disabled' }}>
                เสนอราคาให้
              </Typography>
              <Typography variant="subtitle1">{quotation.customer?.name}</Typography>
              {quotation.customer?.contactPerson && (
                <Typography variant="body2">
                  ผู้ติดต่อ: {quotation.customer.contactPerson}
                </Typography>
              )}
              <Stack
                sx={{
                  gap: 0.5,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {quotation.customer?.phone && (
                  <Typography variant="body2">โทร: {quotation.customer.phone}</Typography>
                )}
                {quotation.customer?.email && (
                  <Typography variant="body2">อีเมล: {quotation.customer.email}</Typography>
                )}
              </Stack>
              {quotation.customer?.address && (
                <Typography variant="body2">ที่อยู่: {quotation.customer.address}</Typography>
              )}
              {quotation.customer?.taxId && (
                <Typography variant="body2">เลขผู้เสียภาษี: {quotation.customer.taxId}</Typography>
              )}
            </Grid>
          </Grid>

          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>รายละเอียด</TableCell>
                    <TableCell>หน่วย</TableCell>
                    <TableCell align="right">จำนวน</TableCell>
                    <TableCell align="right">ราคาต่อหน่วย</TableCell>
                    <TableCell align="right">จำนวนเงิน</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {quotation.items.map((item, index) => (
                    <TableRow key={item.id ?? index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.unit || '-'}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{fBaht(item.unitPrice)}</TableCell>
                      <TableCell align="right">{fBaht(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ width: { xs: 1, sm: 320, md: 360 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ยอดรวม
                </Typography>
                <Typography variant="body2">{fBaht(quotation.subtotal)}</Typography>
              </Box>

              {quotation.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    ส่วนลด
                  </Typography>
                  <Typography variant="body2">-{fBaht(quotation.discount)}</Typography>
                </Box>
              )}

              {quotation.includeVat && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    ภาษีมูลค่าเพิ่ม ({quotation.vatRate}%)
                  </Typography>
                  <Typography variant="body2">{fBaht(quotation.vatAmount)}</Typography>
                </Box>
              )}

              <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">ยอดรวมสุทธิ</Typography>
                <Typography variant="subtitle1">{fBaht(quotation.total)}</Typography>
              </Box>
            </Box>
          </Box>

          {quotation.note && (
            <Box sx={{ display: 'contents' }}>
              <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                หมายเหตุ
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {quotation.note}
              </Typography>
            </Box>
          )}

          {quotation.paymentTerms && (
            <Box sx={{ display: 'contents' }}>
              <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                เงื่อนไขการชำระเงิน
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 3, color: 'text.secondary' }}>
                {quotation.paymentTerms
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, index) => (
                    <Typography key={index} component="li" variant="body2">
                      {line}
                    </Typography>
                  ))}
              </Box>
            </Box>
          )}
        </Card>

        <Card sx={{ p: { xs: 2, sm: 3, md: 5 }, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            ลายมือชื่อ
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                ผู้เสนอราคา
              </Typography>
              <Box
                component="button"
                type="button"
                onClick={() => setSignatureSigner('issuer')}
                aria-label="ลงลายมือชื่อผู้เสนอราคา"
                sx={{
                  p: 0,
                  width: 1,
                  height: 130,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.neutral',
                  cursor: 'pointer',
                  transition: (theme) =>
                    theme.transitions.create(['border-color', 'background-color']),
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.lighter',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                {quotation.issuerSignatureUrl ? (
                  <Box
                    component="img"
                    src={quotation.issuerSignatureUrl}
                    alt="ลายมือชื่อผู้เสนอราคา"
                    sx={{ maxWidth: '85%', maxHeight: 90, objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    ยังไม่ได้ลงชื่อ
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {companyProfile?.storeNameTh || companyProfile?.name || CONFIG.appName}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                ผู้รับข้อเสนอ
              </Typography>
              <Box
                component="button"
                type="button"
                onClick={() => setSignatureSigner('customer')}
                aria-label="ลงลายมือชื่อผู้รับข้อเสนอ"
                sx={{
                  p: 0,
                  width: 1,
                  height: 130,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.neutral',
                  cursor: 'pointer',
                  transition: (theme) =>
                    theme.transitions.create(['border-color', 'background-color']),
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.lighter',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                {quotation.customerSignatureUrl ? (
                  <Box
                    component="img"
                    src={quotation.customerSignatureUrl}
                    alt="ลายมือชื่อผู้รับข้อเสนอ"
                    sx={{ maxWidth: '85%', maxHeight: 90, objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    ยังไม่ได้ลงชื่อ
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {quotation.customer?.name || 'ลูกค้า'}
              </Typography>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: { xs: 2, sm: 3, md: 5 }, mt: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6">ใบเสร็จรับเงิน</Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  ชำระแล้ว
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'success.main' }}>
                  {fBaht(payments.reduce((sum, p) => sum + p.amount, 0))}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  คงเหลือ
                </Typography>
                <Typography variant="subtitle1">
                  {fBaht(
                    Math.max(quotation.total - payments.reduce((sum, p) => sum + p.amount, 0), 0)
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>

          {!payments.length ? (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              ยังไม่มีใบเสร็จรับเงิน
            </Typography>
          ) : (
            payments.map((payment) => (
              <Box
                key={payment.id}
                sx={{
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
                  '&:last-of-type': { borderBottom: 'none' },
                }}
              >
                <Box>
                  <Link
                    component={RouterLink}
                    href={paths.dashboard.payment.details(payment.id)}
                    variant="subtitle2"
                    color="inherit"
                    underline="always"
                  >
                    {payment.receiptNo}
                  </Link>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled' }}>
                    {fDate(payment.paymentDate)} · {PAYMENT_METHOD_LABEL[payment.paymentMethod]}
                  </Typography>
                </Box>
                <Typography variant="subtitle2">{fBaht(payment.amount)}</Typography>
              </Box>
            ))
          )}
        </Card>
      </Box>

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
          พรีวิว PDF — {quotation.quoteNo}
          <IconButton onClick={previewDialog.onFalse}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
            <QuotationPdfDocument
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
              <QuotationPdfDocument
                quotation={quotation}
                companyProfile={companyProfile}
                companyName={CONFIG.appName}
              />
            }
            fileName={`${quotation.quoteNo}.pdf`}
          >
            <Button variant="contained" startIcon={<Iconify icon="eva:cloud-download-fill" />}>
              ดาวน์โหลด PDF
            </Button>
          </PDFDownloadLink>
        </Box>
      </Dialog>

      <QuotationSignatureDialog
        open={!!signatureSigner}
        quotationId={quotation.id}
        signer={signatureSigner}
        onClose={() => setSignatureSigner(null)}
        onSigned={(signatureUrl) =>
          setQuotation((current) => {
            if (!current) return current;
            return signatureSigner === 'issuer'
              ? {
                  ...current,
                  issuerSignatureUrl: signatureUrl,
                  issuerSignedAt: new Date().toISOString(),
                }
              : {
                  ...current,
                  customerSignatureUrl: signatureUrl,
                  customerSignedAt: new Date().toISOString(),
                };
          })
        }
      />
    </DashboardContent>
  );
}
