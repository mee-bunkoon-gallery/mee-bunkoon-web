'use client';

import type { ICompanyProfile } from 'src/types/settings';

import * as z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  RiSave3Line,
  RiImageLine,
  RiBuildingLine,
  RiDeleteBin6Line,
  RiContactsBook3Line,
} from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { fData } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';

import { deleteCompanyLogo, uploadCompanyLogo } from './settings-api';
import {
  companyProfileKeys,
  useCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
} from './settings-queries';

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
  idCardFront: z.union([z.file(), z.string(), z.null()]).optional(),
  idCardWatermark: z.string().optional(),
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
    idCardFront: null,
    idCardWatermark: 'ใช้สำหรับรับจ้างจัดงานเท่านั้น',
  };
}

export function CompanyProfileView() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: loading, isError } = useCompanyProfileQuery();
  const updateMutation = useUpdateCompanyProfileMutation();

  useEffect(() => {
    if (isError) {
      toast.error('โหลดข้อมูลไม่สำเร็จ');
    }
  }, [isError]);

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
      await updateMutation.mutateAsync({
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

      if (data.logo instanceof File) {
        await uploadCompanyLogo(data.logo);
        await queryClient.invalidateQueries({ queryKey: companyProfileKeys.all });
      }

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
      await queryClient.invalidateQueries({ queryKey: companyProfileKeys.all });
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
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4">ข้อมูลบริษัทและผู้ประกอบการ</Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          จัดการข้อมูลที่ใช้แสดงบนใบเสนอราคา ใบเสร็จ สัญญา และเอกสารอื่นของร้าน
        </Typography>
      </Box>

      <Form methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                p: { xs: 2.5, sm: 3 },
                textAlign: 'center',
                position: { md: 'sticky' },
                top: { md: 24 },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: 'grid',
                    borderRadius: 1.5,
                    placeItems: 'center',
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                  }}
                >
                  <RiImageLine size={21} />
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle1">โลโก้กิจการ</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    ใช้แสดงในระบบและบนเอกสาร
                  </Typography>
                </Box>
              </Stack>

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
                  startIcon={<RiDeleteBin6Line />}
                  sx={{ mt: 2 }}
                >
                  ลบโลโก้
                </Button>
              )}

              <Divider sx={{ my: 3, display: { xs: 'none', md: 'block' }, borderStyle: 'dashed' }} />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                startIcon={<RiSave3Line />}
                sx={{ display: { xs: 'none', md: 'inline-flex' } }}
              >
                บันทึกข้อมูล
              </Button>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'grid',
                      borderRadius: 1.5,
                      placeItems: 'center',
                      color: 'primary.main',
                      bgcolor: 'primary.lighter',
                    }}
                  >
                    <RiBuildingLine size={21} />
                  </Box>
                  <Box>
                    <Typography variant="h6">ข้อมูลกิจการ</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      ชื่อและประเภทผู้ประกอบการ
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

                <Stack spacing={2.5}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderRadius: 1.5,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Field.RadioGroup
                      name="entityType"
                      row
                      options={[
                        { value: 'individual', label: 'บุคคลธรรมดา' },
                        { value: 'company', label: 'นิติบุคคล / บริษัท' },
                      ]}
                    />
                  </Box>

                  <Field.Text
                    name="name"
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    label={entityType === 'company' ? 'ชื่อบริษัท' : 'ชื่อ-นามสกุล'}
                  />

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Field.Text
                        name="storeNameTh"
                        label="ชื่อร้าน (ภาษาไทย)"
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Field.Text
                        name="storeNameEn"
                        label="ชื่อร้าน (ภาษาอังกฤษ)"
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                  </Grid>

                  {entityType === 'company' && (
                    <Field.Text
                      name="branch"
                      slotProps={{ inputLabel: { shrink: true } }}
                      label="สาขา (เช่น สำนักงานใหญ่)"
                    />
                  )}
                </Stack>
              </Card>

              <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'grid',
                      borderRadius: 1.5,
                      placeItems: 'center',
                      color: 'primary.main',
                      bgcolor: 'primary.lighter',
                    }}
                  >
                    <RiContactsBook3Line size={21} />
                  </Box>
                  <Box>
                    <Typography variant="h6">ข้อมูลติดต่อและเอกสาร</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      ข้อมูลสำหรับติดต่อและออกเอกสารทางธุรกิจ
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

                <Stack spacing={2.5}>
                  <Field.Text
                    name="taxId"
                    slotProps={{ inputLabel: { shrink: true } }}
                    label="เลขประจำตัวผู้เสียภาษี / เลขบัตรประชาชน"
                  />

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Field.Text
                        name="phone"
                        label="เบอร์โทร"
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Field.Text
                        name="email"
                        label="อีเมล"
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                  </Grid>

                  <Field.Text
                    name="address"
                    label="ที่อยู่"
                    multiline
                    rows={4}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />

                  {entityType === 'individual' && (
                    <Box>
                      <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        หน้าบัตรประชาชน
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        สำหรับยืนยันข้อมูลผู้ประกอบการบุคคลธรรมดา
                      </Typography>
                      <Field.Upload
                        name="idCardFront"
                        maxSize={5 * 1024 * 1024}
                        accept={{ 'image/*': [] }}
                        helperText="อัปโหลดหรือถ่ายภาพหน้าบัตรประชาชน ขนาดไม่เกิน 5 MB"
                      />
                      <Field.Text
                        name="idCardWatermark"
                        label="ข้อความลายน้ำบนบัตร"
                        sx={{ mt: 2.5 }}
                        helperText="ข้อความนี้จะแสดงทับบนภาพบัตรประชาชน"
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Box>
                  )}
                </Stack>
              </Card>
            </Stack>

            <Box
              sx={{
                mt: 3,
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'flex-end',
              }}
            >
              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                startIcon={<RiSave3Line />}
              >
                บันทึกข้อมูล
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Form>
    </DashboardContent>
  );
}
