'use client';

import type { IDelivery } from 'src/types/delivery';
import type { IContract } from 'src/types/contract';
import type { IQuotation } from 'src/types/quotation';

import * as z from 'zod';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { htmlToPlainText } from 'src/components/editor';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useCustomersQuery } from 'src/sections/customer/customer-queries';

import { saveDeliveryImages } from './delivery-api';
import { DELIVERY_METHOD_OPTIONS } from './delivery-status';
import {
  deliveryKeys,
  useCreateDeliveryMutation,
  useUpdateDeliveryMutation,
} from './delivery-queries';

// ----------------------------------------------------------------------

const STATUS_OPTIONS: { value: IDelivery['status']; label: string }[] = [
  { value: 'draft', label: 'ฉบับร่าง' },
  { value: 'delivered', label: 'ส่งมอบแล้ว' },
  { value: 'acknowledged', label: 'ลูกค้ารับทราบแล้ว' },
];

export type DeliveryFormSchemaType = z.infer<typeof DeliveryFormSchema>;

export const DeliveryFormSchema = z.object({
  customer: schemaUtils.nullableInput(z.object({ id: z.string(), name: z.string() }), {
    error: 'กรุณาเลือกลูกค้า',
  }),
  deliveryDate: z.string().min(1, { error: 'กรุณาเลือกวันที่ส่งมอบ' }),
  deliveryMethod: z.enum(['in_person', 'online_link', 'courier', 'other']),
  itemsDelivered: z.string().optional(),
  images: z
    .array(z.union([z.instanceof(File), z.string()]))
    .min(3, { error: 'กรุณาแนบภาพอย่างน้อย 3 ภาพ' })
    .max(8, { error: 'แนบภาพได้ไม่เกิน 8 ภาพ' }),
  note: z.string().optional(),
  status: z.enum(['draft', 'delivered', 'acknowledged']),
});

function toDefaultValues(
  delivery?: IDelivery | null,
  sourceQuotation?: IQuotation | null,
  sourceContract?: IContract | null
): DeliveryFormSchemaType {
  if (delivery) {
    return {
      customer: delivery.customer ? { id: delivery.customer.id, name: delivery.customer.name } : null,
      deliveryDate: dayjs(delivery.deliveryDate).format(),
      deliveryMethod: delivery.deliveryMethod,
      itemsDelivered: delivery.itemsDelivered ?? '',
      images: delivery.imageUrls ?? [],
      note: delivery.note ?? '',
      status: delivery.status,
    };
  }

  if (sourceQuotation) {
    const itemsDelivered = sourceQuotation.items
      .map((item) => `${item.description} (${item.quantity} ${item.unit ?? ''})`.trim())
      .join('\n');

    return {
      customer: sourceQuotation.customer
        ? { id: sourceQuotation.customer.id, name: sourceQuotation.customer.name }
        : null,
      deliveryDate: dayjs().format(),
      deliveryMethod: 'in_person',
      itemsDelivered,
      images: [],
      note: '',
      status: 'draft',
    };
  }

  if (sourceContract) {
    return {
      customer: sourceContract.customer
        ? { id: sourceContract.customer.id, name: sourceContract.customer.name }
        : null,
      deliveryDate: dayjs().format(),
      deliveryMethod: 'in_person',
      itemsDelivered: htmlToPlainText(sourceContract.scopeOfWork ?? ''),
      images: [],
      note: '',
      status: 'draft',
    };
  }

  return {
    customer: null,
    deliveryDate: dayjs().format(),
    deliveryMethod: 'in_person',
    itemsDelivered: '',
    images: [],
    note: '',
    status: 'draft',
  };
}

type Props = {
  currentDelivery?: IDelivery | null;
  sourceQuotation?: IQuotation | null;
  sourceContract?: IContract | null;
  quotationId?: string | null;
  contractId?: string | null;
};

export function DeliveryNewEditForm({
  currentDelivery,
  sourceQuotation,
  sourceContract,
  quotationId,
  contractId,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: customers = [], isError: isCustomersError } = useCustomersQuery();
  const createMutation = useCreateDeliveryMutation();
  const updateMutation = useUpdateDeliveryMutation();

  useEffect(() => {
    if (isCustomersError) toast.error('โหลดรายชื่อลูกค้าไม่สำเร็จ');
  }, [isCustomersError]);

  const methods = useForm({
    resolver: zodResolver(DeliveryFormSchema),
    defaultValues: toDefaultValues(currentDelivery, sourceQuotation, sourceContract),
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(toDefaultValues(currentDelivery, sourceQuotation, sourceContract));
  }, [currentDelivery, sourceQuotation, sourceContract, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        quotationId: quotationId ?? sourceQuotation?.id ?? currentDelivery?.quotationId ?? null,
        contractId: contractId ?? currentDelivery?.contractId ?? null,
        customerId: data.customer!.id,
        deliveryDate: dayjs(data.deliveryDate).format('YYYY-MM-DD'),
        deliveryMethod: data.deliveryMethod,
        itemsDelivered: data.itemsDelivered,
        note: data.note,
        status: data.status,
      };

      const delivery = currentDelivery
        ? await updateMutation.mutateAsync({ id: currentDelivery.id, input: payload })
        : await createMutation.mutateAsync(payload);

      const imageUrls = await saveDeliveryImages(delivery.id, data.images);

      queryClient.setQueryData(deliveryKeys.detail(delivery.id), (current?: IDelivery) =>
        current ? { ...current, imageUrls } : current
      );

      toast.success(currentDelivery ? 'แก้ไขเอกสารส่งมอบงานแล้ว' : 'สร้างเอกสารส่งมอบงานแล้ว');
      router.push(paths.dashboard.delivery.details(delivery.id));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2.5}>
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
                      label="ลูกค้า / ผู้รับมอบงาน"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Field.Select name="status" label="สถานะ">
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Field.DatePicker name="deliveryDate" label="วันที่ส่งมอบ" />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Field.Select name="deliveryMethod" label="วิธีส่งมอบ">
              {DELIVERY_METHOD_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Field.Text
              name="itemsDelivered"
              label="รายการที่ส่งมอบ"
              multiline
              rows={5}
              helperText="พิมพ์แต่ละรายการขึ้นบรรทัดใหม่ จะแสดงเป็นข้อ ๆ ในเอกสาร"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Field.Text name="note" label="หมายเหตุ" multiline rows={2} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              ภาพประกอบการส่งมอบงาน
            </Typography>
            <Controller
              name="images"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Upload
                  multiple
                  value={field.value}
                  accept={{ 'image/*': [] }}
                  error={!!error}
                  helperText={error?.message ?? 'แนบภาพได้ 3-8 ภาพ'}
                  onDrop={(acceptedFiles) => field.onChange([...field.value, ...acceptedFiles])}
                  onRemove={(file) =>
                    field.onChange(field.value.filter((item: File | string) => item !== file))
                  }
                  onRemoveAll={() => field.onChange([])}
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={isSubmitting}
        sx={{ mt: 3 }}
      >
        {currentDelivery ? 'บันทึกการแก้ไข' : 'สร้างเอกสารส่งมอบงาน'}
      </Button>
    </Form>
  );
}
