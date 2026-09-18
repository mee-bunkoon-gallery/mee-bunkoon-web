'use client';

import type { IServiceItem } from 'src/types/quotation';
import type { IColorTheme } from 'src/types/color-theme';

import * as z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { uploadServiceItemImage } from './service-api';
import { useColorThemesQuery } from '../color-theme/color-theme-queries';
import { useCreateServiceItemMutation, useUpdateServiceItemMutation } from './service-queries';

const ServiceItemSchema = z.object({
  image: z.union([z.file(), z.string(), z.null()]).optional(),
  name: z.string().min(1, { error: 'กรุณากรอกชื่อรายการบริการ' }),
  description: z.string().optional(),
  unit: z.string().min(1, { error: 'กรุณากรอกหน่วยนับ' }),
  unitPrice: z.coerce.number().min(0, { error: 'ราคาต้องไม่ติดลบ' }),
  colorThemes: z.array(z.custom<IColorTheme>()),
});

type FormValues = z.infer<typeof ServiceItemSchema>;

function getDefaultValues(currentServiceItem?: IServiceItem | null): FormValues {
  return {
    image: currentServiceItem?.imageUrl ?? null,
    name: currentServiceItem?.name ?? '',
    description: currentServiceItem?.description ?? '',
    unit: currentServiceItem?.unit ?? 'รายการ',
    unitPrice: currentServiceItem?.unitPrice ?? 0,
    colorThemes: currentServiceItem?.colorThemes ?? [],
  };
}

export function ServiceNewEditForm({
  currentServiceItem,
}: {
  currentServiceItem?: IServiceItem | null;
}) {
  const router = useRouter();
  const { data: colorThemes = [], isError: isColorThemesError } = useColorThemesQuery();
  const createMutation = useCreateServiceItemMutation();
  const updateMutation = useUpdateServiceItemMutation();
  const methods = useForm({
    resolver: zodResolver(ServiceItemSchema),
    defaultValues: getDefaultValues(currentServiceItem),
  });
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => reset(getDefaultValues(currentServiceItem)), [currentServiceItem, reset]);
  useEffect(() => {
    if (isColorThemesError) toast.error('โหลดข้อมูลโทนสีไม่สำเร็จ');
  }, [isColorThemesError]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const input = {
        name: data.name.trim(),
        description: data.description?.trim(),
        imageUrl: typeof data.image === 'string' ? data.image : null,
        unit: data.unit.trim(),
        unitPrice: data.unitPrice,
        colorThemeIds: data.colorThemes.map((theme) => theme.id),
      };
      let savedServiceItem = currentServiceItem
        ? await updateMutation.mutateAsync({ id: currentServiceItem.id, input })
        : await createMutation.mutateAsync(input);

      if (data.image instanceof File) {
        const imageUrl = await uploadServiceItemImage(savedServiceItem.id, data.image);
        savedServiceItem = await updateMutation.mutateAsync({
          id: savedServiceItem.id,
          input: { ...input, imageUrl },
        });
      }

      toast.success(currentServiceItem ? 'แก้ไขรายการบริการแล้ว' : 'เพิ่มรายการบริการแล้ว');
      router.push(paths.dashboard.service.root);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'บันทึกรายการบริการไม่สำเร็จ');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">ข้อมูลรายการบริการ</Typography>
              <Field.Text name="name" label="ชื่อรายการบริการ" />
              <Field.Text name="description" label="รายละเอียด" multiline rows={5} />
              <Field.Autocomplete
                multiple
                name="colorThemes"
                label="โทนสี"
                placeholder="เลือกโทนสีได้มากกว่า 1 รายการ"
                options={colorThemes}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id} sx={{ gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        bgcolor: option.hexCode,
                        borderRadius: '50%',
                        border: 1,
                        borderColor: 'divider',
                        flexShrink: 0,
                      }}
                    />
                    {option.name}
                  </Box>
                )}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field.Text name="unit" label="หน่วยนับ" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field.Text
                    name="unitPrice"
                    label="ราคาต่อหน่วย"
                    type="number"
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">฿</InputAdornment>,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                รูปภาพ
              </Typography>
              <Field.Upload
                name="image"
                maxSize={2 * 1024 * 1024}
                helperText="รองรับ PNG, JPG หรือ WEBP ขนาดไม่เกิน 2MB"
              />
            </Card>
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
              <Button component={RouterLink} href={paths.dashboard.service.root} color="inherit">
                ยกเลิก
              </Button>
              <Button type="submit" variant="contained" loading={isSubmitting}>
                {currentServiceItem ? 'บันทึกการแก้ไข' : 'สร้างรายการบริการ'}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Form>
  );
}
