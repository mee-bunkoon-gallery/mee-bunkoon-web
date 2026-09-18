'use client';

import type { IEventType } from 'src/types/event-type';
import type { IServiceItem } from 'src/types/quotation';
import type { IPromotionPackage, PromotionPackageInput } from 'src/types/promotion-package';

import * as z from 'zod';
import dayjs from 'dayjs';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiAddLine, RiDeleteBin6Fill } from '@remixicon/react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
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
import { Form, Field } from 'src/components/hook-form';

import { useServiceItemsQuery } from '../service/service-queries';
import { useEventTypesQuery } from '../event-type/event-type-queries';
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
    eventType: z.custom<IEventType>().nullable().refine(Boolean, {
      error: 'กรุณาเลือกประเภทงาน',
    }),
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
    eventType: currentPackage?.eventType ?? null,
    items: currentPackage?.items.length
      ? currentPackage.items.map((item) => ({
          serviceItem: item.serviceItem,
          quantity: item.quantity,
          unitPrice: item.serviceItem.unitPrice,
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
  const { data: eventTypes = [], isError: isEventTypesError } = useEventTypesQuery();
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
  useEffect(() => {
    if (isEventTypesError) toast.error('โหลดประเภทงานไม่สำเร็จ');
  }, [isEventTypesError]);

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
      eventTypeId: data.eventType!.id,
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
              <Box>
                <Typography variant="h6">ข้อมูลแพ็กเกจ</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  กรอกชื่อ ประเภทงาน และราคาที่ต้องการแสดงให้ลูกค้า
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Field.Text name="name" label="ชื่อแพ็กเกจ" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
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
              <Controller
                name="eventType"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    options={eventTypes}
                    value={field.value}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_event, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="ประเภทงาน"
                        placeholder="เลือกประเภทงานสำหรับแพ็กเกจ"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
              <Field.Text
                name="description"
                label="รายละเอียดโปรโมชั่น"
                multiline
                rows={4}
                helperText="อธิบายจุดเด่นและเงื่อนไขสำคัญของแพ็กเกจ"
              />
            </Stack>
          </Card>

          <Card sx={{ p: 3, mt: 3 }}>
            <Stack spacing={2.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">รายการบริการในแพ็กเกจ</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    เลือกรายการ กำหนดจำนวน และตรวจสอบราคาต่อหน่วย
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                    typography: 'subtitle2',
                  }}
                >
                  {fields.length} รายการ
                </Box>
              </Stack>
              <Card variant="outlined">
                <Stack divider={<Divider flexItem />}>
                  {fields.map((item, index) => (
                    <Grid
                      container
                      spacing={1.5}
                      alignItems="center"
                      key={item.id}
                      sx={{
                        p: { xs: 2, md: 2.5 },
                        bgcolor: index % 2 ? 'background.neutral' : undefined,
                      }}
                    >
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
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          รวม
                        </Typography>
                        <Typography variant="subtitle2" color="primary.main">
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
                          <RiDeleteBin6Fill />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                </Stack>
              </Card>
              <Button
                variant="outlined"
                startIcon={<RiAddLine />}
                onClick={() => append(emptyItem)}
                sx={{ alignSelf: 'flex-start' }}
              >
                เพิ่มรายการบริการ
              </Button>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                รูปภาพปก
              </Typography>
              <Field.Upload
                name="image"
                maxSize={2 * 1024 * 1024}
                helperText="รองรับ PNG, JPG หรือ WEBP ขนาดไม่เกิน 2MB"
              />
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2.5 }}>
                ระยะเวลาและการเผยแพร่
              </Typography>
              <Stack spacing={2.5}>
                <Field.DatePicker name="startDate" label="วันที่เริ่มโปรโมชั่น" />
                <Field.DatePicker name="endDate" label="วันที่สิ้นสุดโปรโมชั่น" />
                <Field.Switch name="active" label="เปิดใช้งานโปรโมชั่น" />
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6">สรุปราคา</Typography>
              <Stack spacing={1.75} sx={{ my: 3 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    ราคาปกติ
                  </Typography>
                  <Typography variant="subtitle2">{fBaht(normalPrice)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    ราคาโปรโมชั่น
                  </Typography>
                  <Typography variant="subtitle2" color="primary.main">
                    {fBaht(Number(values.promotionPrice) || 0)}
                  </Typography>
                </Stack>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">ลูกค้าประหยัด</Typography>
                  <Typography variant="h5" color="success.main">
                    {fBaht(Math.max(normalPrice - (Number(values.promotionPrice) || 0), 0))}
                  </Typography>
                </Stack>
              </Stack>
              <Stack spacing={1.5}>
                <Button type="submit" size="large" variant="contained" loading={isSubmitting}>
                  {currentPackage ? 'บันทึกการแก้ไข' : 'สร้างแพ็กเกจ'}
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
          </Stack>
        </Grid>
      </Grid>
    </Form>
  );
}
