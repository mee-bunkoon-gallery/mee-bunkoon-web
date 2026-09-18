'use client';

import type { IHeroBanner } from 'src/types/hero-banner';

import * as z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { uploadHeroBannerImage } from './hero-banner-api';
import { useCreateHeroBannerMutation, useUpdateHeroBannerMutation } from './hero-banner-queries';

const Schema = z.object({
  image: z.union([z.file(), z.string(), z.null()]),
  eyebrow: z.string(),
  title: z.string().min(1, { error: 'กรุณากรอกหัวข้อ Banner' }),
  subtitle: z.string(),
  buttonLabel: z.string(),
  buttonUrl: z.string(),
  displayOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof Schema>;

const defaults = (banner?: IHeroBanner | null): FormValues => ({
  image: banner?.imageUrl ?? null,
  eyebrow: banner?.eyebrow ?? '',
  title: banner?.title ?? '',
  subtitle: banner?.subtitle ?? '',
  buttonLabel: banner?.buttonLabel ?? '',
  buttonUrl: banner?.buttonUrl ?? '',
  displayOrder: banner?.displayOrder ?? 0,
  isActive: banner?.isActive ?? true,
});

export function HeroBannerNewEditForm({ currentBanner }: { currentBanner?: IHeroBanner | null }) {
  const router = useRouter();
  const createMutation = useCreateHeroBannerMutation();
  const updateMutation = useUpdateHeroBannerMutation();
  const methods = useForm({
    resolver: zodResolver(Schema),
    defaultValues: defaults(currentBanner),
  });
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => reset(defaults(currentBanner)), [currentBanner, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentBanner && !(data.image instanceof File)) {
        throw new Error('กรุณาเลือกรูป Banner');
      }

      const input = {
        eyebrow: data.eyebrow?.trim() || null,
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || null,
        buttonLabel: data.buttonLabel?.trim() || null,
        buttonUrl: data.buttonUrl?.trim() || null,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      };
      const saved = currentBanner
        ? await updateMutation.mutateAsync({ id: currentBanner.id, input })
        : await createMutation.mutateAsync(input);

      if (data.image instanceof File) {
        await uploadHeroBannerImage(saved.id, data.image);
        await updateMutation.mutateAsync({ id: saved.id, input });
      }

      toast.success(currentBanner ? 'แก้ไข Banner แล้ว' : 'สร้าง Banner แล้ว');
      router.push(paths.dashboard.heroBanner.root);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'บันทึก Banner ไม่สำเร็จ');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">ข้อความบน Banner</Typography>
              <Field.Text name="eyebrow" label="ข้อความกำกับ" />
              <Field.Text name="title" label="หัวข้อ" required />
              <Field.Text name="subtitle" label="คำอธิบาย" multiline rows={4} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field.Text name="buttonLabel" label="ข้อความบนปุ่ม" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field.Text name="buttonUrl" label="ลิงก์ปุ่ม" placeholder="/packages/" />
                </Grid>
              </Grid>
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                รูป Banner
              </Typography>
              <Field.Upload
                name="image"
                maxSize={8 * 1024 * 1024}
                helperText="แนะนำภาพแนวนอน ขนาดไม่เกิน 8MB"
              />
            </Card>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Field.Text name="displayOrder" type="number" label="ลำดับการแสดง" />
                <Field.Switch name="isActive" label="เปิดแสดงบนหน้าแรก" />
              </Stack>
            </Card>
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
              <Button component={RouterLink} href={paths.dashboard.heroBanner.root} color="inherit">
                ยกเลิก
              </Button>
              <Button type="submit" variant="contained" loading={isSubmitting}>
                {currentBanner ? 'บันทึกการแก้ไข' : 'สร้าง Banner'}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Form>
  );
}
