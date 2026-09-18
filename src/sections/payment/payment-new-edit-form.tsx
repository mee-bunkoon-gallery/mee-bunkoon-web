'use client';

import type { IPayment } from 'src/types/payment';
import type { ICustomer } from 'src/types/quotation';

import * as z from 'zod';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useCustomersQuery } from 'src/sections/customer/customer-queries';
import { useQuotationQuery, useQuotationsQuery } from 'src/sections/quotation/quotation-queries';

import { uploadPaymentSlip } from './payment-api';
import { PAYMENT_METHOD_OPTIONS, PAYMENT_PURPOSE_OPTIONS } from './payment-method';
import {
  usePaymentsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
} from './payment-queries';

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

  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);

  const { data: customers = [], isError: isCustomersError } = useCustomersQuery();
  const { data: quotations = [], isError: isQuotationsError } = useQuotationsQuery();

  const createMutation = useCreatePaymentMutation();
  const updateMutation = useUpdatePaymentMutation();

  const {
    data: selectedQuotationDetail,
    isError: isSelectedQuotationError,
  } = useQuotationQuery(selectedQuotationId ?? '');
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
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(
      toDefaultValues(currentPayment, {
        customer: prefillCustomer,
        amount: prefillAmount,
        quotation: prefillQuotation,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPayment, reset]);

  useEffect(() => {
    if (!selectedQuotationId || !selectedQuotationDetail) return;

    const paid = (selectedQuotationPayments ?? []).reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    setValue(
      'customer',
      selectedQuotationDetail.customer
        ? { id: selectedQuotationDetail.customer.id, name: selectedQuotationDetail.customer.name }
        : null
    );
    setValue('amount', Math.max(selectedQuotationDetail.total - paid, 0));
  }, [selectedQuotationId, selectedQuotationDetail, selectedQuotationPayments, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        quotationId: data.quotation?.id ?? (!currentPayment ? quotationId : null) ?? null,
        contractId: contractId ?? currentPayment?.contractId ?? null,
        customerId: data.customer!.id,
        paymentDate: dayjs(data.paymentDate).format('YYYY-MM-DD'),
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentPurpose: data.paymentPurpose,
        referenceNo: data.referenceNo,
        note: data.note,
      };

      const payment = currentPayment
        ? await updateMutation.mutateAsync({ id: currentPayment.id, input: payload })
        : await createMutation.mutateAsync(payload);

      if (data.slip instanceof File) {
        await uploadPaymentSlip(payment.id, data.slip);
      }

      toast.success(currentPayment ? 'แก้ไขใบเสร็จรับเงินแล้ว' : 'ออกใบเสร็จรับเงินแล้ว');
      router.push(paths.dashboard.payment.details(payment.id));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  });

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
            <Box sx={{ mb: 2 }}>หลักฐานการโอนเงิน / สลิป</Box>

            <Field.Upload
              name="slip"
              multiple={false}
              accept={{ 'image/*': [], 'application/pdf': [] }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{ mt: 3 }}
            >
              {currentPayment ? 'บันทึกการแก้ไข' : 'ออกใบเสร็จรับเงิน'}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
