'use client';

import type { IPayment } from 'src/types/payment';
import type { IContract } from 'src/types/contract';
import type { ICompanyProfile } from 'src/types/settings';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
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

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EditorContentView } from 'src/components/editor';
import { LoadingScreen } from 'src/components/loading-screen';

import { getContract } from './contract-api';
import { getPayments } from '../payment/payment-api';
import { CONTRACT_STATUS_META } from './contract-status';
import { getCompanyProfile } from '../settings/settings-api';
import { ContractPdfDocument } from './contract-pdf-document';
import { PAYMENT_METHOD_LABEL } from '../payment/payment-method';
import { ContractSignatureDialog } from './contract-signature-dialog';
import {
  toClauseBodyHtml,
  parseContractClauses,
  resolveContractMentionHtml,
  buildContractMentionContext,
  resolveContractMentionTokens,
} from './contract-clauses';

// ----------------------------------------------------------------------

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <Button variant="contained">กำลังเตรียมไฟล์...</Button> }
);

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

function renderLines(text: string | null) {
  return (text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

async function addIdCardWatermark(file: File, contractName: string): Promise<File> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new window.Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('ไม่สามารถเตรียมรูปภาพได้');

    context.drawImage(image, 0, 0);
    const fontSize = Math.max(18, Math.round(canvas.width / 24));
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((-18 * Math.PI) / 180);
    context.fillStyle = 'rgba(68, 68, 68, 0.38)';
    context.font = `700 ${fontSize}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('ใช้สำหรับประกอบสัญญา', 0, -fontSize * 0.8);
    context.fillText(contractName || 'สัญญาจ้างงาน', 0, fontSize * 1.2);
    context.fillText('เท่านั้น', 0, fontSize * 2.4);
    context.restore();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92)
    );
    if (!blob) throw new Error('ไม่สามารถสร้างรูปภาพได้');
    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

type Props = {
  contractId: string;
};

export function ContractDetailsView({ contractId }: Props) {
  const router = useRouter();

  const [contract, setContract] = useState<IContract | null>(null);
  const [companyProfile, setCompanyProfile] = useState<ICompanyProfile | null>(null);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const previewDialog = useBoolean();
  const [signatureSigner, setSignatureSigner] = useState<'issuer' | 'customer' | null>(null);

  useEffect(() => {
    getCompanyProfile()
      .then(setCompanyProfile)
      .catch(() => {});

    getPayments({ contractId })
      .then(setPayments)
      .catch(() => {});

    getContract(contractId)
      .then(setContract)
      .catch((error) => {
        console.error(error);
        toast.error('ไม่พบสัญญานี้');
        router.replace(paths.dashboard.contract.root);
      })
      .finally(() => setLoading(false));
  }, [contractId, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!contract) {
    return null;
  }

  const statusMeta = CONTRACT_STATUS_META[contract.status];
  const paymentLines = renderLines(contract.paymentTerms);
  const clauses = parseContractClauses(contract.termsConditions);
  const mentionContext = buildContractMentionContext(contract, companyProfile);

  const uploadIdCard = async (file?: File) => {
    if (!file) return;
    try {
      const watermarkedFile = await addIdCardWatermark(
        file,
        contract.contractName || contract.contractNo
      );
      const formData = new FormData();
      formData.append('file', watermarkedFile);
      const response = await fetch(`/api/contracts/${contract.id}/id-card/`, {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message);
      setContract({ ...contract, idCardFrontUrl: payload.idCardFrontUrl });
      toast.success('บันทึกหน้าบัตรประชาชนแล้ว');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'อัปโหลดรูปไม่สำเร็จ');
    }
  };

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
        <Box>
          <Typography variant="h4">{contract.contractName || contract.contractNo}</Typography>
          {!!contract.contractName && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {contract.contractNo}
            </Typography>
          )}
          {!!contract.quotation && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              อ้างอิงใบเสนอราคาเลขที่{' '}
              <Link
                component={RouterLink}
                href={paths.dashboard.quotation.details(contract.quotation.id)}
                underline="always"
                color="inherit"
              >
                {contract.quotation.quoteNo}
              </Link>{' '}
              · มูลค่าสัญญา {fBaht(contract.totalAmount)}
            </Typography>
          )}
          <Label variant="soft" color={statusMeta.color} sx={{ mt: 1 }}>
            {statusMeta.label}
          </Label>
        </Box>

        <Box
          sx={{
            gap: 1,
            width: { xs: 1, sm: 'auto' },
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            '& .MuiButton-root': {
              minHeight: 40,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              width: { xs: 'calc(50% - 4px)', sm: 'auto' },
              justifyContent: { xs: 'flex-start', sm: 'center' },
            },
          }}
        >
          <Button
            component={RouterLink}
            href={paths.dashboard.contract.edit(contract.id)}
            variant="outlined"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            แก้ไข
          </Button>

          <Button
            component={RouterLink}
            href={`${paths.dashboard.payment.new}?contractId=${contract.id}`}
            variant="outlined"
            startIcon={<Iconify icon="solar:wad-of-money-bold" />}
          >
            ออกใบเสร็จรับเงิน
          </Button>

          <Button
            component={RouterLink}
            href={`${paths.dashboard.delivery.new}?contractId=${contract.id}`}
            variant="outlined"
            startIcon={<Iconify icon="solar:inbox-in-bold-duotone" />}
          >
            ส่งมอบงาน
          </Button>

          <Button
            component={RouterLink}
            href={`${paths.dashboard.jobQueue.new}?contractId=${contract.id}`}
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

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.disabled' }}>
              ผู้รับจ้าง
            </Typography>
            <Typography variant="subtitle1">
              {companyProfile?.storeNameTh || companyProfile?.name || CONFIG.appName}
            </Typography>
            {companyProfile?.phone && (
              <Typography variant="body2">โทร: {companyProfile.phone}</Typography>
            )}
            {companyProfile?.address && (
              <Typography variant="body2">ที่อยู่: {companyProfile.address}</Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.disabled' }}>
              ผู้ว่าจ้าง
            </Typography>
            <Typography variant="subtitle1">{contract.customer?.name}</Typography>
            {contract.customer?.phone && (
              <Typography variant="body2">โทร: {contract.customer.phone}</Typography>
            )}
            {contract.customer?.address && (
              <Typography variant="body2">ที่อยู่: {contract.customer.address}</Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                วันที่ทำสัญญา
              </Typography>
              <Typography variant="body2">{fDate(contract.contractDate)}</Typography>
            </Box>
            {contract.eventDate && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  วันที่จัดงาน
                </Typography>
                <Typography variant="body2">{fDate(contract.eventDate)}</Typography>
              </Box>
            )}
            {contract.eventTime && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  ช่วงเวลา
                </Typography>
                <Typography variant="body2">{contract.eventTime}</Typography>
              </Box>
            )}
            {contract.eventLocation && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  สถานที่
                </Typography>
                <Typography variant="body2">{contract.eventLocation}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: { xs: 3, md: 5 }, mt: 3 }}>
        {!!contract.scopeOfWork && (
          <>
            <Typography variant="subtitle1" mb={3}>
              {contract?.contractName || 'ชื่อสัญญา '}
            </Typography>
            <EditorContentView
              content={resolveContractMentionHtml(
                toClauseBodyHtml(contract.scopeOfWork),
                mentionContext
              )}
              sx={{ color: 'text.primary' }}
            />
          </>
        )}

        {!!paymentLines.length && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              เงื่อนไขการชำระเงิน
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 3, color: 'text.secondary' }}>
              {paymentLines.map((line, index) => (
                <Typography key={index} component="li" variant="body2">
                  {line}
                </Typography>
              ))}
            </Box>
          </>
        )}

        {!!clauses.length && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            {clauses.map((clause, index) => (
              <Box key={clause.id}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  ข้อ {index + 1}
                  {clause.title
                    ? ` ${resolveContractMentionTokens(clause.title, mentionContext)}`
                    : ''}
                </Typography>
                <EditorContentView
                  content={resolveContractMentionHtml(
                    toClauseBodyHtml(clause.body),
                    mentionContext
                  )}
                  sx={{ color: 'text.secondary', pl: 1 }}
                />
              </Box>
            ))}
          </Box>
        )}

        {contract.note && (
          <>
            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              หมายเหตุ
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {contract.note}
            </Typography>
          </>
        )}
      </Card>

      <Card sx={{ p: { xs: 2.5, md: 3 }, mt: 3 }}>
        <Grid container spacing={{ xs: 2.5, md: 3 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6">หน้าบัตรประชาชน</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
              สำเนาหน้าบัตรของผู้ว่าจ้างสำหรับแนบกับสัญญา
            </Typography>
            <Button
              component="label"
              size="small"
              variant="outlined"
              sx={{ mt: 2 }}
              startIcon={<Iconify icon="solar:gallery-add-bold" />}
            >
              {contract.idCardFrontUrl ? 'เปลี่ยนรูป' : 'แนบรูปหน้าบัตร'}
              <input
                hidden
                accept="image/*"
                capture="environment"
                type="file"
                onChange={(event) => uploadIdCard(event.target.files?.[0])}
              />
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {contract.idCardFrontUrl ? (
              <Box
                component="img"
                src={contract.idCardFrontUrl}
                alt="หน้าบัตรประชาชนผู้ว่าจ้าง"
                onClick={() =>
                  window.open(contract.idCardFrontUrl!, '_blank', 'noopener,noreferrer')
                }
                sx={{
                  width: 1,
                  height: 'auto',
                  display: 'block',
                  cursor: 'zoom-in',
                  objectFit: 'contain',
                  maxHeight: { xs: 280, md: 340 },
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            ) : (
              <Box
                sx={{
                  minHeight: 190,
                  display: 'grid',
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  color: 'text.secondary',
                  placeItems: 'center',
                }}
              >
                ยังไม่ได้แนบหน้าบัตรประชาชน
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: { xs: 3, md: 5 }, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          ลายมือชื่อ
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              ผู้รับจ้าง
            </Typography>
            <Box
              component="button"
              type="button"
              onClick={() => setSignatureSigner('issuer')}
              sx={{
                p: 0,
                height: 130,
                width: 1,
                cursor: 'pointer',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.neutral',
                transition: 'border-color 150ms ease, background-color 150ms ease',
                '&:hover, &:focus-visible': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              {contract.issuerSignatureUrl ? (
                <Box
                  component="img"
                  src={contract.issuerSignatureUrl}
                  alt="ลายมือชื่อผู้รับจ้าง"
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
              ผู้ว่าจ้าง
            </Typography>
            <Box
              component="button"
              type="button"
              onClick={() => setSignatureSigner('customer')}
              sx={{
                p: 0,
                height: 130,
                width: 1,
                cursor: 'pointer',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.neutral',
                transition: 'border-color 150ms ease, background-color 150ms ease',
                '&:hover, &:focus-visible': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              {contract.customerSignatureUrl ? (
                <Box
                  component="img"
                  src={contract.customerSignatureUrl}
                  alt="ลายมือชื่อผู้ว่าจ้าง"
                  sx={{ maxWidth: '85%', maxHeight: 90, objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  ยังไม่ได้ลงชื่อ
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              {contract.customer?.name || 'ลูกค้า'}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: { xs: 3, md: 5 }, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                  Math.max(contract.totalAmount - payments.reduce((sum, p) => sum + p.amount, 0), 0)
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
          พรีวิว PDF — {contract.contractNo}
          <IconButton onClick={previewDialog.onFalse}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
            <ContractPdfDocument
              contract={contract}
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
              <ContractPdfDocument
                contract={contract}
                companyProfile={companyProfile}
                companyName={CONFIG.appName}
              />
            }
            fileName={`${contract.contractNo}.pdf`}
          >
            <Button variant="contained" startIcon={<Iconify icon="eva:cloud-download-fill" />}>
              ดาวน์โหลด PDF
            </Button>
          </PDFDownloadLink>
        </Box>
      </Dialog>

      <ContractSignatureDialog
        open={!!signatureSigner}
        contractId={contract.id}
        signer={signatureSigner}
        onClose={() => setSignatureSigner(null)}
        onSigned={(signatureUrl) =>
          setContract((current) => {
            if (!current) return current;
            return signatureSigner === 'issuer'
              ? { ...current, issuerSignatureUrl: signatureUrl }
              : { ...current, customerSignatureUrl: signatureUrl };
          })
        }
      />
    </DashboardContent>
  );
}
