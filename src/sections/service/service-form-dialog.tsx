'use client';

import type { IServiceItem } from 'src/types/quotation';

import * as z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { createServiceItem, updateServiceItem, uploadServiceItemImage } from './service-api';

// ----------------------------------------------------------------------

export type ServiceFormSchemaType = z.infer<typeof ServiceFormSchema>;

export const ServiceFormSchema = z.object({
  name: z.string().min(1, { error: 'กรุณากรอกชื่อรายการบริการ' }),
  image: z.union([z.file(), z.string(), z.null()]).optional(),
  description: z.string().optional(),
  unit: z.string().min(1, { error: 'กรุณากรอกหน่วยนับ' }),
  unitPrice: z.coerce.number({ error: 'กรุณากรอกราคา' }).min(0, { error: 'ราคาต้องไม่ติดลบ' }),
});

const defaultValues: ServiceFormSchemaType = {
  name: '',
  image: null,
  description: '',
  unit: 'รายการ',
  unitPrice: 0,
};

type Props = {
  open: boolean;
  onClose: () => void;
  currentServiceItem?: IServiceItem | null;
  onSuccess: (serviceItem: IServiceItem) => void;
};

export function ServiceFormDialog({ open, onClose, currentServiceItem, onSuccess }: Props) {
  const methods = useForm({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (!open) return;

    reset(
      currentServiceItem
        ? {
            name: currentServiceItem.name,
            image: currentServiceItem.imageUrl,
            description: currentServiceItem.description ?? '',
            unit: currentServiceItem.unit,
            unitPrice: currentServiceItem.unitPrice,
          }
        : defaultValues
    );
  }, [open, currentServiceItem, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const input = {
        name: data.name,
        description: data.description,
        unit: data.unit,
        unitPrice: data.unitPrice,
        imageUrl: typeof data.image === 'string' ? data.image : null,
      };
      let serviceItem = currentServiceItem
        ? await updateServiceItem(currentServiceItem.id, input)
        : await createServiceItem(input);

      if (data.image instanceof File) {
        const imageUrl = await uploadServiceItemImage(serviceItem.id, data.image);
        serviceItem = { ...serviceItem, imageUrl };
      }

      toast.success(currentServiceItem ? 'แก้ไขรายการบริการแล้ว' : 'เพิ่มรายการบริการแล้ว');
      onSuccess(serviceItem);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{currentServiceItem ? 'แก้ไขรายการบริการ' : 'เพิ่มรายการบริการ'}</DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Field.Upload
              name="image"
              maxSize={2 * 1024 * 1024}
              helperText="รองรับไฟล์ PNG, JPG หรือ WEBP ขนาดไม่เกิน 2MB"
            />
            <Field.Text name="name" label="ชื่อรายการบริการ" />
            <Field.Text name="description" label="รายละเอียด" multiline rows={2} />

            <Box sx={{ display: 'flex', gap: 2.5 }}>
              <Field.Text name="unit" label="หน่วยนับ" sx={{ flex: 1 }} />
              <Field.Text name="unitPrice" label="ราคาต่อหน่วย" type="number" sx={{ flex: 1 }} />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            บันทึก
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
