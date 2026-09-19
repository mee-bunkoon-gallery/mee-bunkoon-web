'use client';

import type { ReactNode } from 'react';
import type { IVendor } from 'src/types/vendor';

import * as z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RiSave3Line,
  RiStore2Line,
  RiDeleteBin6Line,
  RiStickyNote2Line,
  RiContactsBook3Line,
} from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { THAI_PROVINCES } from '../job-queue/thai-provinces';
import { useEventTypesQuery } from '../event-type/event-type-queries';
import { useCreateVendorMutation, useUpdateVendorMutation } from './vendor-queries';
import { deleteVendorImage, uploadVendorImage, saveVendorDocuments } from './vendor-api';

const VendorSchema = z.object({
  name: z.string().min(1, { error: 'กรุณากรอกชื่อ Vendor' }),
  image: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
  category: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(''), z.email({ error: 'อีเมลไม่ถูกต้อง' })]).optional(),
  lineId: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  paymentTerms: z.string().optional(),
  note: z.string().optional(),
  documents: z.array(z.union([z.instanceof(File), z.string()])).max(10),
  isActive: z.boolean(),
});

type VendorFormValues = z.infer<typeof VendorSchema>;

const defaultValues: VendorFormValues = {
  name: '',
  image: null,
  category: '',
  contactPerson: '',
  phone: '',
  email: '',
  lineId: '',
  taxId: '',
  address: '',
  province: '',
  paymentTerms: '',
  note: '',
  documents: [],
  isActive: true,
};

function getDefaultValues(vendor?: IVendor | null): VendorFormValues {
  if (!vendor) return defaultValues;
  return {
    name: vendor.name,
    image: vendor.imageUrl,
    category: vendor.category ?? '',
    contactPerson: vendor.contactPerson ?? '',
    phone: vendor.phone ?? '',
    email: vendor.email ?? '',
    lineId: vendor.lineId ?? '',
    taxId: vendor.taxId ?? '',
    address: vendor.address ?? '',
    province: vendor.province ?? '',
    paymentTerms: vendor.paymentTerms ?? '',
    note: vendor.note ?? '',
    documents: vendor.documentUrls ?? [],
    isActive: vendor.isActive,
  };
}

export function VendorNewEditForm({ currentVendor }: { currentVendor?: IVendor | null }) {
  const router = useRouter();
  const createMutation = useCreateVendorMutation();
  const updateMutation = useUpdateVendorMutation();
  const { data: eventTypes = [] } = useEventTypesQuery();
  const methods = useForm({
    resolver: zodResolver(VendorSchema),
    defaultValues: getDefaultValues(currentVendor),
  });
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => reset(getDefaultValues(currentVendor)), [currentVendor, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const input = {
        ...data,
        category: data.category || null,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        lineId: data.lineId || null,
        taxId: data.taxId || null,
        address: data.address || null,
        province: data.province || null,
        paymentTerms: data.paymentTerms || null,
        note: data.note || null,
      };
      const vendor = currentVendor
        ? await updateMutation.mutateAsync({ id: currentVendor.id, input })
        : await createMutation.mutateAsync(input);
      await saveVendorDocuments(vendor.id, data.documents);
      if (data.image instanceof File) await uploadVendorImage(vendor.id, data.image);
      else if (currentVendor?.imageUrl && !data.image) await deleteVendorImage(vendor.id);
      toast.success(currentVendor ? 'แก้ไข Vendor แล้ว' : 'เพิ่ม Vendor แล้ว');
      router.push(paths.dashboard.vendor.root);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
              <SectionTitle
                icon={<RiStore2Line />}
                title="ข้อมูล Vendor"
                description="ข้อมูลผู้รับจ้างหรือซัพพลายเออร์"
              />
              <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Field.Text name="name" label="ชื่อ Vendor / บริษัท" required />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Field.Select name="category" label="ประเภท Vendor">
                    <MenuItem value="">
                      <em>ไม่ระบุ</em>
                    </MenuItem>
                    {eventTypes.map((eventType) => (
                      <MenuItem key={eventType.id} value={eventType.name}>
                        {eventType.name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field.Text name="taxId" label="เลขประจำตัวผู้เสียภาษี" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field.Select name="province" label="จังหวัด">
                    <MenuItem value="">
                      <em>ไม่ระบุ</em>
                    </MenuItem>
                    {THAI_PROVINCES.map((province) => (
                      <MenuItem key={province} value={province}>
                        {province}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Field.Text name="address" label="ที่อยู่" multiline rows={3} />
                </Grid>
              </Grid>
            </Card>

            <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
              <SectionTitle
                icon={<RiStickyNote2Line />}
                title="เอกสาร Vendor"
                description="แนบใบเสนอราคา หนังสือรับรอง เอกสารภาษี หรือเอกสารประกอบอื่น"
              />
              <Stack mt={1}>
                <Field.Upload
                  name="documents"
                  multiple
                  maxFiles={10}
                  maxSize={15 * 1024 * 1024}
                  accept={{
                    'application/pdf': [],
                    'image/png': [],
                    'image/jpeg': [],
                    'image/webp': [],
                  }}
                  helperText="รองรับ PDF, PNG, JPG และ WEBP สูงสุด 10 ไฟล์ ไฟล์ละไม่เกิน 15MB"
                  onRemove={(file) =>
                    methods.setValue(
                      'documents',
                      methods.getValues('documents').filter((item) => item !== file),
                      { shouldDirty: true, shouldValidate: true }
                    )
                  }
                  onRemoveAll={() =>
                    methods.setValue('documents', [], {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </Stack>
            </Card>

            <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
              <SectionTitle
                icon={<RiContactsBook3Line />}
                title="ข้อมูลติดต่อและการชำระเงิน"
                description="ช่องทางติดต่อและข้อตกลงในการว่าจ้าง"
              />
              <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field.Text name="contactPerson" label="ผู้ติดต่อ" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field.Text name="phone" label="เบอร์โทร" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field.Text name="email" label="อีเมล" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field.Text name="lineId" label="LINE ID" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Field.Text
                    name="paymentTerms"
                    label="เงื่อนไขการชำระเงิน"
                    placeholder="เช่น มัดจำ 50% ที่เหลือชำระวันส่งงาน"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Field.Text name="note" label="หมายเหตุ" multiline rows={3} />
                </Grid>
              </Grid>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 3, position: { lg: 'sticky' }, top: { lg: 24 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              รูปภาพ Vendor
            </Typography>
            <Field.UploadAvatar
              name="image"
              maxSize={5 * 1024 * 1024}
              accept={{ 'image/png': [], 'image/jpeg': [], 'image/webp': [] }}
              helperText={
                <Typography
                  variant="caption"
                  sx={{ mt: 1.5, display: 'block', textAlign: 'center', color: 'text.secondary' }}
                >
                  รองรับ PNG, JPG และ WEBP ขนาดไม่เกิน 5MB
                </Typography>
              }
            />
            {!!methods.watch('image') && (
              <Button
                fullWidth
                size="small"
                color="error"
                startIcon={<RiDeleteBin6Line />}
                onClick={() => methods.setValue('image', null, { shouldDirty: true })}
                sx={{ mt: 1 }}
              >
                ลบรูปภาพ
              </Button>
            )}
            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
            <Typography variant="h6">สถานะและการบันทึก</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
              Vendor ที่ปิดใช้งานจะยังเก็บข้อมูลเดิมไว้
            </Typography>
            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
            <Field.Switch name="isActive" label="เปิดใช้งาน Vendor" />
            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
            <Stack spacing={1.5}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                loading={isSubmitting}
                startIcon={<RiSave3Line />}
              >
                {currentVendor ? 'บันทึกการแก้ไข' : 'เพิ่ม Vendor'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => router.push(paths.dashboard.vendor.root)}
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

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 1.5,
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}
