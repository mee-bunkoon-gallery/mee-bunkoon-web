'use client';

import type { ICompanyProfile } from 'src/types/settings';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { fData } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';

import {
  getCompanyProfile,
  deleteCompanyLogo,
  uploadCompanyLogo,
  updateCompanyProfile,
} from './settings-api';

// ----------------------------------------------------------------------

export type CompanyProfileSchemaType = z.infer<typeof CompanyProfileSchema>;

export const CompanyProfileSchema = z.object({
  entityType: z.enum(['individual', 'company']),
  name: z.string().min(1, { error: 'กรุณากรอกชื่อ' }),
  storeNameTh: z.string().optional(),
  storeNameEn: z.string().optional(),
  branch: z.string().optional(),
  taxId: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(''), z.email({ error: 'อีเมลไม่ถูกต้อง' })]).optional(),
  address: z.string().optional(),
  logo: z.union([z.file(), z.string(), z.null()]).optional(),
});

function toDefaultValues(profile: ICompanyProfile): CompanyProfileSchemaType {
  return {
    entityType: profile.entityType ?? 'individual',
    name: profile.name,
    storeNameTh: profile.storeNameTh ?? '',
    storeNameEn: profile.storeNameEn ?? '',
    branch: profile.branch ?? '',
    taxId: profile.taxId ?? '',
    phone: profile.phone ?? '',
    email: profile.email ?? '',
    address: profile.address ?? '',
    logo: profile.logoUrl,
  };
}

export function CompanyProfileView() {
  const [profile, setProfile] = useState<ICompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanyProfile()
      .then(setProfile)
      .catch(() => toast.error('โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  const methods = useForm({
    resolver: zodResolver(CompanyProfileSchema),
    defaultValues: { entityType: 'individual' },
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (profile) {
      reset(toDefaultValues(profile));
    }
  }, [profile, reset]);

  const entityType = watch('entityType') ?? 'individual';

  const onSubmit = handleSubmit(async (data) => {
    try {
      const updated = await updateCompanyProfile({
        entityType: data.entityType,
        name: data.name,
        storeNameTh: data.storeNameTh,
        storeNameEn: data.storeNameEn,
        branch: data.branch,
        taxId: data.taxId,
        phone: data.phone,
        email: data.email,
        address: data.address,
      });

      let logoUrl = updated.logoUrl;

      if (data.logo instanceof File) {
        logoUrl = await uploadCompanyLogo(data.logo);
      }

      setProfile({ ...updated, logoUrl });
      toast.success('บันทึกข้อมูลแล้ว');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  });

  const handleRemoveLogo = async () => {
    try {
      await deleteCompanyLogo();
      methods.setValue('logo', null);
      setProfile((prev) => (prev ? { ...prev, logoUrl: null } : prev));
      toast.success('ลบโลโก้แล้ว');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบโลโก้ไม่สำเร็จ');
    }
  };

  if (loading || !profile) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 1 }}>
        ตั้งค่าข้อมูลผู้เสนอราคา
      </Typography>
      <Typography variant="body2" sx={{ mb: 5, color: 'text.secondary' }}>
        ข้อมูลนี้จะถูกใช้เป็นข้อมูล &quot;ผู้เสนอราคา&quot; ในเอกสารทุกฉบับ เช่น ใบเสนอราคา
      </Typography>

      <Form methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Field.UploadAvatar
                name="logo"
                maxSize={2 * 1024 * 1024}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{ mt: 2, mx: 'auto', display: 'block', color: 'text.disabled' }}
                  >
                    รองรับ *.png, *.jpg, *.webp, *.svg
                    <br /> ขนาดไม่เกิน {fData(2 * 1024 * 1024)}
                  </Typography>
                }
              />

              {!!profile.logoUrl && (
                <Button
                  color="error"
                  size="small"
                  onClick={handleRemoveLogo}
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  sx={{ mt: 2 }}
                >
                  ลบโลโก้
                </Button>
              )}
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Field.RadioGroup
                  name="entityType"
                  row
                  options={[
                    { value: 'individual', label: 'บุคคลธรรมดา' },
                    { value: 'company', label: 'นิติบุคคล / บริษัท' },
                  ]}
                />

                <Field.Text
                  name="name"
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  label={entityType === 'company' ? 'ชื่อบริษัท' : 'ชื่อ-นามสกุล'}
                />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5 }}>
                  <Field.Text
                    name="storeNameTh"
                    label="ชื่อร้าน (ภาษาไทย)"
                    sx={{ flex: 1 }}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <Field.Text
                    name="storeNameEn"
                    label="ชื่อร้าน (ภาษาอังกฤษ)"
                    sx={{ flex: 1 }}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Box>

                {entityType === 'company' && (
                  <Field.Text
                    name="branch"
                    slotProps={{ inputLabel: { shrink: true } }}
                    label="สาขา (เช่น สำนักงานใหญ่)"
                  />
                )}

                <Field.Text
                  name="taxId"
                  slotProps={{ inputLabel: { shrink: true } }}
                  label="เลขประจำตัวผู้เสียภาษี / เลขบัตรประชาชน"
                />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5 }}>
                  <Field.Text
                    name="phone"
                    label="เบอร์โทร"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <Field.Text
                    name="email"
                    label="อีเมล"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Box>

                <Field.Text
                  name="address"
                  label="ที่อยู่"
                  multiline
                  rows={3}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
            </Card>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
                บันทึก
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Form>
    </DashboardContent>
  );
}
