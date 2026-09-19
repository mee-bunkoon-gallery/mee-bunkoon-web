'use client';

import type { IPayment } from 'src/types/payment';
import type { ICustomer } from 'src/types/quotation';

import * as z from 'zod';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBoolean } from 'minimal-shared/hooks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiEyeLine, RiCloseLine, RiSave3Line } from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useCustomersQuery } from 'src/sections/customer/customer-queries';
import { useCompanyProfileQuery } from 'src/sections/settings/settings-queries';
import { useQuotationQuery, useQuotationsQuery } from 'src/sections/quotation/quotation-queries';

import { PaymentPdfDocument } from './payment-pdf-document';
import { getPayment, getNextReceiptNo, uploadPaymentSlip } from './payment-api';
import { PAYMENT_METHOD_OPTIONS, PAYMENT_PURPOSE_OPTIONS } from './payment-method';
import {
  usePaymentsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
} from './payment-queries';

// ----------------------------------------------------------------------

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

// ----------------------------------------------------------------------

export type PaymentFormSchemaType = z.infer<typeof PaymentFormSchema>;

export const PaymentFormSchema = z.object({
  quotation: z.object({ id: z.string(), quoteNo: z.string() }).nullable().optional(),
  customer: schemaUtils.nullableInput(z.object({ id: z.string(), name: z.string() }), {
    error: 'กรุณาเลือกลูกค้า',
  }),
  paymentDate: z.string().min(1, { error: 'กรุณาเลือกวันที่รับเงิน' }),
  amount: z.coerce.number().positive({ error: 'จำนวนเงินต้องมากกว่า 0' }),
  paymentMethod: z.enum(['cash', 'transfer', 'credit_card', 'other']),
  paymentPurpose: z.enum(['deposit', 'partial', 'full', 'other']),
  referenceNo: z.string().optional(),
  note: z.string().optional(),
  slip: z.union([z.file(), z.string(), z.null()]).optional(),
});

function toDefaultValues(
  payment?: IPayment | null,
  prefill?: {
    customer?: ICustomer | null;
    amount?: number;
    quotation?: { id: string; quoteNo: string } | null;
  }
): PaymentFormSchemaType {
  if (payment) {
    return {
      quotation: payment.quotation ?? null,
      customer: payment.customer ? { id: payment.customer.id, name: payment.customer.name } : null,
      paymentDate: dayjs(payment.paymentDate).format(),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentPurpose: payment.paymentPurpose,
      referenceNo: payment.referenceNo ?? '',
      note: payment.note ?? '',
      slip: payment.slipUrl,
    };
  }

  return {
    quotation: prefill?.quotation ?? null,
    customer: prefill?.customer ? { id: prefill.customer.id, name: prefill.customer.name } : null,
    paymentDate: dayjs().format(),
    amount: prefill?.amount ?? 0,
    paymentMethod: 'transfer',
    paymentPurpose: 'partial',
    referenceNo: '',
    note: '',
    slip: null,
  };
}

type Props = {
  currentPayment?: IPayment | null;
  quotationId?: string | null;
  contractId?: string | null;
  prefillCustomer?: ICustomer | null;
  prefillAmount?: number;
  prefillQuotation?: { id: string; quoteNo: string } | null;
};

export function PaymentNewEditForm({
  currentPayment,
  quotationId,
  contractId,
  prefillCustomer,
  prefillAmount,
  prefillQuotation,
}: Props) {
  const router = useRouter();
  const previewDialog = useBoolean();

  const [savedPayment, setSavedPayment] = useState<IPayment | null>(null);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(
    currentPayment?.quotationId ?? prefillQuotation?.id ?? quotationId ?? null
  );

  const { data: companyProfile } = useCompanyProfileQuery();
  const { data: nextReceiptNo = 'กำลังสร้างเลข...' } = useQuery({
    queryKey: ['payments', 'next-receipt-no'],
    queryFn: getNextReceiptNo,
  });
  const { data: customers = [], isError: isCustomersError } = useCustomersQuery();
  const { data: quotations = [], isError: isQuotationsError } = useQuotationsQuery();

  const createMutation = useCreatePaymentMutation();
  const updateMutation = useUpdatePaymentMutation();

  const { data: selectedQuotationDetail, isError: isSelectedQuotationError } = useQuotationQuery(
    selectedQuotationId ?? ''
  );
  const { data: selectedQuotationPayments } = usePaymentsQuery({
    quotationId: selectedQuotationId ?? undefined,
  });

  useEffect(() => {
    if (isCustomersError) toast.error('โหลดรายชื่อลูกค้าไม่สำเร็จ');
  }, [isCustomersError]);

  useEffect(() => {
    if (isQuotationsError) toast.error('โหลดใบเสนอราคาไม่สำเร็จ');
  }, [isQuotationsError]);

  useEffect(() => {
    if (selectedQuotationId && isSelectedQuotationError) {
      toast.error('โหลดข้อมูลใบเสนอราคาไม่สำเร็จ');
    }
  }, [selectedQuotationId, isSelectedQuotationError]);

  const methods = useForm({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: toDefaultValues(currentPayment, {
      customer: prefillCustomer,
      amount: prefillAmount,
      quotation: prefillQuotation,
    }),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    setSavedPayment(null);
    setSelectedQuotationId(
      currentPayment?.quotationId ?? prefillQuotation?.id ?? quotationId ?? null
    );
    reset(
      toDefaultValues(currentPayment, {
        customer: prefillCustomer,
        amount: prefillAmount,
        quotation: prefillQuotation,
      })
    );
  }, [currentPayment, prefillAmount, prefillCustomer, prefillQuotation, quotationId, reset]);

  useEffect(() => {
    if (!selectedQuotationId || !selectedQuotationDetail) return;

    const activePaymentId = savedPayment?.id ?? currentPayment?.id;
    const paid = (selectedQuotationPayments ?? []).reduce(
      (sum, payment) => sum + (payment.id === activePaymentId ? 0 : payment.amount),
      0
    );

    setValue(
      'customer',
      selectedQuotationDetail.customer
        ? { id: selectedQuotationDetail.customer.id, name: selectedQuotationDetail.customer.name }
        : null
    );
    setValue('amount', Math.max(selectedQuotationDetail.total - paid, 0));
  }, [
    currentPayment?.id,
    savedPayment?.id,
    selectedQuotationId,
    selectedQuotationDetail,
    selectedQuotationPayments,
    setValue,
  ]);

  const values = watch() as PaymentFormSchemaType;
  const activePayment = savedPayment ?? currentPayment;
  const previewPayment: IPayment = {
    id: activePayment?.id ?? 'preview',
    receiptNo:
      activePayment?.status === 'completed' ? activePayment.receiptNo : nextReceiptNo,
    quotationId: values.quotation?.id ?? quotationId ?? null,
    quotation: values.quotation ?? null,
    contractId: contractId ?? activePayment?.contractId ?? null,
    customerId: values.customer?.id ?? '',
    customer: customers.find((customer) => customer.id === values.customer?.id) ?? null,
    paymentDate: values.paymentDate
      ? dayjs(values.paymentDate).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD'),
    amount: Number(values.amount) || 0,
    paymentMethod: values.paymentMethod,
    paymentPurpose: values.paymentPurpose,
    status: activePayment?.status ?? 'draft',
    referenceNo: values.referenceNo ?? null,
    slipUrl: typeof values.slip === 'string' ? values.slip : null,
    note: values.note ?? null,
    createdAt: activePayment?.createdAt ?? new Date().toISOString(),
    updatedAt: activePayment?.updatedAt ?? new Date().toISOString(),
  };

  const savePayment = async (data: PaymentFormSchemaType, stayOnPage: boolean) => {
    try {
      const payload = {
        quotationId: data.quotation?.id ?? (!activePayment ? quotationId : null) ?? null,
        contractId: contractId ?? activePayment?.contractId ?? null,
        customerId: data.customer!.id,
        paymentDate: dayjs(data.paymentDate).format('YYYY-MM-DD'),
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentPurpose: data.paymentPurpose,
        status: stayOnPage ? ('draft' as const) : ('completed' as const),
        referenceNo: data.referenceNo,
        note: data.note,
      };

      const payment = activePayment
        ? await updateMutation.mutateAsync({ id: activePayment.id, input: payload })
        : await createMutation.mutateAsync(payload);

      if (data.slip instanceof File) {
        await uploadPaymentSlip(payment.id, data.slip);
      }

      if (stayOnPage) {
        const refreshedPayment = await getPayment(payment.id);
        setSavedPayment(refreshedPayment);
        reset(toDefaultValues(refreshedPayment));
        setSelectedQuotationId(refreshedPayment.quotationId);
        toast.success('บันทึกแบบร่างแล้ว');
        return;
      }

      toast.success(activePayment ? 'แก้ไขใบเสร็จรับเงินแล้ว' : 'ออกใบเสร็จรับเงินแล้ว');
      router.push(paths.dashboard.payment.details(payment.id));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  const onSubmit = handleSubmit((data) => savePayment(data, false));
  const onSaveDraft = handleSubmit((data) => savePayment(data, true));

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="quotation"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={quotations}
                      getOptionLabel={(option) => option.quoteNo}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={
                        quotations.find((quotation) => quotation.id === field.value?.id) ??
                        field.value ??
                        null
                      }
                      onChange={(_event, selectedQuotation) => {
                        field.onChange(
                          selectedQuotation
                            ? { id: selectedQuotation.id, quoteNo: selectedQuotation.quoteNo }
                            : null
                        );
                        setSelectedQuotationId(selectedQuotation ? selectedQuotation.id : null);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="อ้างอิงใบเสนอราคา (ไม่บังคับ)" />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="customer"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      options={customers.map((c) => ({ id: c.id, name: c.name }))}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={field.value}
                      onChange={(_event, newValue) => field.onChange(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="ลูกค้า / ผู้ชำระเงิน"
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Field.DatePicker name="paymentDate" label="วันที่รับเงิน" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Field.Text name="amount" label="จำนวนเงิน (บาท)" type="number" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Field.Select name="paymentMethod" label="ช่องทางการชำระเงิน">
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Field.Select name="paymentPurpose" label="ประเภทการรับเงิน">
                  {PAYMENT_PURPOSE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Field.Text name="referenceNo" label="เลขที่อ้างอิง / เลขที่รายการโอน" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Field.Text name="note" label="หมายเหตุ" multiline rows={2} />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                เลขที่ใบเสร็จรับเงิน
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.25, color: 'primary.main' }}>
                {activePayment?.status === 'completed' ? activePayment.receiptNo : nextReceiptNo}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>หลักฐานการโอนเงิน / สลิป</Box>

            <Field.Upload
              name="slip"
              multiple={false}
              accept={{ 'image/*': [], 'application/pdf': [] }}
            />

            <Button
              fullWidth
              type="button"
              variant="outlined"
              size="large"
              startIcon={<RiEyeLine />}
              onClick={previewDialog.onTrue}
              sx={{ mt: 3 }}
            >
              ดูตัวอย่าง PDF
            </Button>

            <Button
              fullWidth
              type="button"
              variant="soft"
              size="large"
              loading={isSubmitting}
              startIcon={<RiSave3Line />}
              onClick={onSaveDraft}
              sx={{ mt: 1.5 }}
            >
              บันทึกแบบร่าง
            </Button>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{ mt: 1.5 }}
            >
              {activePayment ? 'บันทึกและดูใบเสร็จ' : 'ออกและดูใบเสร็จรับเงิน'}
            </Button>
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
          พรีวิวใบเสร็จรับเงิน — {previewPayment.receiptNo}
          <IconButton type="button" onClick={previewDialog.onFalse} aria-label="ปิดพรีวิว PDF">
            <RiCloseLine />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {previewDialog.value && (
            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
              <PaymentPdfDocument
                payment={previewPayment}
                quotation={selectedQuotationDetail}
                companyProfile={companyProfile}
                companyName={CONFIG.appName}
              />
            </PDFViewer>
          )}
        </DialogContent>
      </Dialog>
    </Form>
  );
}
