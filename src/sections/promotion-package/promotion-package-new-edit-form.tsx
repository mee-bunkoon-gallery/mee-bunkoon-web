'use client';

import type { IServiceItem } from 'src/types/quotation';
import type { IPromotionPackage, PromotionPackageInput } from 'src/types/promotion-package';

import * as z from 'zod';
import dayjs from 'dayjs';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fBaht } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useServiceItemsQuery } from '../service/service-queries';
import {
  createPromotionPackage,
  updatePromotionPackage,
  uploadPromotionPackageImage,
} from './promotion-package-api';

const PackageItemSchema = z.object({
  serviceItem: z.custom<IServiceItem>().nullable().refine(Boolean, {
    error: 'กรุณาเลือกรายการบริการ',
  }),
  quantity: z.coerce.number().positive({ error: 'จำนวนต้องมากกว่า 0' }),
  unitPrice: z.coerce.number().min(0, { error: 'ราคาต้องไม่ติดลบ' }),
});

export const PromotionPackageFormSchema = z
  .object({
    name: z.string().min(1, { error: 'กรุณากรอกชื่อแพ็กเกจ' }),
    image: z.union([z.file(), z.string(), z.null()]).optional(),
    description: z.string().optional(),
    promotionPrice: z.coerce.number().min(0, { error: 'ราคาต้องไม่ติดลบ' }),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    active: z.boolean(),
    items: z.array(PackageItemSchema).min(1, { error: 'กรุณาเพิ่มอย่างน้อย 1 รายการ' }),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      dayjs(data.endDate).isAfter(data.startDate) ||
      dayjs(data.endDate).isSame(data.startDate, 'day'),
    { path: ['endDate'], error: 'วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น' }
  );

type FormValues = z.infer<typeof PromotionPackageFormSchema>;
const emptyItem = { serviceItem: null, quantity: 1, unitPrice: 0 };

function getDefaultValues(currentPackage?: IPromotionPackage | null): FormValues {
  return {
    name: currentPackage?.name ?? '',
    image: currentPackage?.imageUrl ?? null,
    description: currentPackage?.description ?? '',
    promotionPrice: currentPackage?.promotionPrice ?? 0,
    startDate: currentPackage?.startDate ? dayjs(currentPackage.startDate).format() : null,
    endDate: currentPackage?.endDate ? dayjs(currentPackage.endDate).format() : null,
    active: currentPackage?.active ?? true,
    items: currentPackage?.items.length
      ? currentPackage.items.map((item) => ({
          serviceItem: item.serviceItem,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      : [emptyItem],
  };
}

export function PromotionPackageNewEditForm({
  currentPackage,
}: {
  currentPackage?: IPromotionPackage | null;
}) {
  const router = useRouter();
  const { data: services = [], isError: isServicesError } = useServiceItemsQuery();
  const methods = useForm({
    resolver: zodResolver(PromotionPackageFormSchema),
    defaultValues: getDefaultValues(currentPackage),
  });
  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const values = watch() as FormValues;

  useEffect(() => reset(getDefaultValues(currentPackage)), [currentPackage, reset]);
  useEffect(() => {
    if (isServicesError) toast.error('โหลดรายการบริการไม่สำเร็จ');
  }, [isServicesError]);

  const normalPrice = useMemo(
    () =>
      values.items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
        0
      ),
    [values.items]
  );

  const onSubmit = handleSubmit(async (data) => {
    const input: PromotionPackageInput = {
      name: data.name.trim(),
      imageUrl: typeof data.image === 'string' ? data.image : null,
      description: data.description?.trim(),
      promotionPrice: data.promotionPrice,
      startDate: data.startDate ? dayjs(data.startDate).format('YYYY-MM-DD') : null,
      endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : null,
      active: data.active,
      items: data.items.map((item) => ({
        serviceItemId: item.serviceItem!.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    try {
      const savedPackage = currentPackage
        ? (await updatePromotionPackage(currentPackage.id, input), currentPackage)
        : await createPromotionPackage(input);
      if (data.image instanceof File) {
        await uploadPromotionPackageImage(savedPackage.id, data.image);
      }
      toast.success(currentPackage ? 'แก้ไขแพ็กเกจแล้ว' : 'สร้างแพ็กเกจแล้ว');
      router.push(paths.dashboard.promotionPackage.root);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ');
    }
  });

  const handlePickService = (index: number, serviceItem: IServiceItem | null) => {
    setValue(`items.${index}.serviceItem`, serviceItem, { shouldValidate: true });
    if (serviceItem) setValue(`items.${index}.unitPrice`, serviceItem.unitPrice);
  };

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Field.Upload
                name="image"
                maxSize={2 * 1024 * 1024}
                helperText="ภาพปกแพ็กเกจ รองรับ PNG, JPG หรือ WEBP ขนาดไม่เกิน 2MB"
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Field.Text name="name" label="ชื่อแพ็กเกจ" />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Field.Text
                    name="promotionPrice"
                    label="ราคาโปรโมชั่น"
                    type="number"
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">฿</InputAdornment>,
                      },
                    }}
                  />
                </Grid>
              </Grid>
              <Field.Text name="description" label="รายละเอียดโปรโมชั่น" multiline rows={3} />
              <Typography variant="h6">รายการบริการในแพ็กเกจ</Typography>
              <Card variant="outlined">
                <Stack divider={<Divider flexItem />}>
                  {fields.map((item, index) => (
                    <Grid container spacing={1.5} alignItems="center" key={item.id} sx={{ p: 2 }}>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Controller
                          name={`items.${index}.serviceItem`}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Autocomplete
                              options={services.filter(
                                (service) =>
                                  !values.items.some(
                                    (selected, selectedIndex) =>
                                      selectedIndex !== index &&
                                      selected.serviceItem?.id === service.id
                                  )
                              )}
                              value={field.value}
                              getOptionLabel={(option) => option.name}
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              onChange={(_event, value) => handlePickService(index, value)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="รายการบริการ"
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 5, md: 2 }}>
                        <Field.Text name={`items.${index}.quantity`} label="จำนวน" type="number" />
                      </Grid>
                      <Grid size={{ xs: 7, md: 3 }}>
                        <Field.Text
                          name={`items.${index}.unitPrice`}
                          label="ราคาต่อหน่วย"
                          type="number"
                        />
                      </Grid>
                      <Grid size={{ xs: 9, md: 1 }} sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2">
                          {fBaht(
                            (Number(values.items[index]?.quantity) || 0) *
                              (Number(values.items[index]?.unitPrice) || 0)
                          )}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 3, md: 1 }} sx={{ textAlign: 'right' }}>
                        <IconButton
                          color="error"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                </Stack>
              </Card>
              <Button
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => append(emptyItem)}
                sx={{ alignSelf: 'flex-start' }}
              >
                เพิ่มรายการบริการ
              </Button>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field.DatePicker name="startDate" label="วันที่เริ่มโปรโมชั่น" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field.DatePicker name="endDate" label="วันที่สิ้นสุดโปรโมชั่น" />
                </Grid>
              </Grid>
              <Field.Switch name="active" label="เปิดใช้งานโปรโมชั่น" />
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 3, position: { lg: 'sticky' }, top: { lg: 96 } }}>
            <Typography variant="h6">สรุปราคา</Typography>
            <Stack spacing={1.5} sx={{ my: 3 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ราคาปกติ
                </Typography>
                <Typography variant="subtitle2">{fBaht(normalPrice)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ราคาโปรโมชั่น
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
                  {fBaht(Number(values.promotionPrice) || 0)}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">ประหยัด</Typography>
                <Typography variant="h6" sx={{ color: 'success.main' }}>
                  {fBaht(Math.max(normalPrice - (Number(values.promotionPrice) || 0), 0))}
                </Typography>
              </Stack>
            </Stack>
            <Stack spacing={1.5}>
              <Button type="submit" variant="contained" loading={isSubmitting}>
                บันทึกแพ็กเกจ
              </Button>
              <Button
                component={RouterLink}
                href={paths.dashboard.promotionPackage.root}
                color="inherit"
              >
                ยกเลิก
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
