'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useBoolean } from 'minimal-shared/hooks';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
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

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

import { useDeliveryQuery } from './delivery-queries';
import { DeliveryPdfDocument } from './delivery-pdf-document';
import { useCompanyProfileQuery } from '../settings/settings-queries';
import { DELIVERY_STATUS_META, DELIVERY_METHOD_LABEL } from './delivery-status';

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

type Props = {
  deliveryId: string;
};

export function DeliveryDetailsView({ deliveryId }: Props) {
  const router = useRouter();

  const previewDialog = useBoolean();

  const { data: companyProfile } = useCompanyProfileQuery();

  const {
    data: delivery,
    isLoading,
    isError,
  } = useDeliveryQuery(deliveryId);

  useEffect(() => {
    if (isError) {
      toast.error('ไม่พบเอกสารส่งมอบงานนี้');
      router.replace(paths.dashboard.delivery.root);
    }
  }, [isError, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!delivery) {
    return null;
  }

  const statusMeta = DELIVERY_STATUS_META[delivery.status];
  const itemLines = renderLines(delivery.itemsDelivered);

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
          <Typography variant="h4">{delivery.deliveryNo}</Typography>
          <Label variant="soft" color={statusMeta.color} sx={{ mt: 1 }}>
            {statusMeta.label}
          </Label>
        </Box>

        <Box sx={{ gap: 1.5, display: 'flex' }}>
          <Button
            component={RouterLink}
            href={paths.dashboard.delivery.edit(delivery.id)}
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
              ผู้ส่งมอบ
            </Typography>
            <Typography variant="subtitle1">
              {companyProfile?.storeNameTh || companyProfile?.name || CONFIG.appName}
            </Typography>
            {companyProfile?.phone && (
              <Typography variant="body2">โทร: {companyProfile.phone}</Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.disabled' }}>
              ผู้รับมอบ
            </Typography>
            <Typography variant="subtitle1">{delivery.customer?.name}</Typography>
            {delivery.customer?.phone && (
              <Typography variant="body2">โทร: {delivery.customer.phone}</Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                วันที่ส่งมอบ
              </Typography>
              <Typography variant="body2">{fDate(delivery.deliveryDate)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                วิธีส่งมอบ
              </Typography>
              <Typography variant="body2">
                {DELIVERY_METHOD_LABEL[delivery.deliveryMethod]}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {!!itemLines.length && (
          <>
            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              รายการที่ส่งมอบ
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 3, color: 'text.secondary' }}>
              {itemLines.map((line, index) => (
                <Typography key={index} component="li" variant="body2">
                  {line}
                </Typography>
              ))}
            </Box>
          </>
        )}

        {!!delivery.imageUrls.length && (
          <>
            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              ภาพประกอบการส่งมอบงาน
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
              }}
            >
              {delivery.imageUrls.map((url, index) => (
                <Box
                  key={url}
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener"
                  sx={{ display: 'block', borderRadius: 1, overflow: 'hidden' }}
                >
                  <Box
                    component="img"
                    src={url}
                    alt={`ภาพส่งมอบงาน ${index + 1}`}
                    sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}

        {delivery.note && (
          <>
            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              หมายเหตุ
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {delivery.note}
            </Typography>
          </>
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
          พรีวิว PDF — {delivery.deliveryNo}
          <IconButton onClick={previewDialog.onFalse}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
            <DeliveryPdfDocument
              delivery={delivery}
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
              <DeliveryPdfDocument
                delivery={delivery}
                companyProfile={companyProfile}
                companyName={CONFIG.appName}
              />
            }
            fileName={`${delivery.deliveryNo}.pdf`}
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
