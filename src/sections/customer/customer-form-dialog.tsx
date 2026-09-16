'use client';

import type { ICustomer } from 'src/types/quotation';

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

import { createCustomer, updateCustomer } from './customer-api';

// ----------------------------------------------------------------------

export type CustomerFormSchemaType = z.infer<typeof CustomerFormSchema>;

export const CustomerFormSchema = z.object({
  name: z.string().min(1, { error: 'กรุณากรอกชื่อลูกค้า' }),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(''), z.email({ error: 'อีเมลไม่ถูกต้อง' })]).optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  citizenId: z.string().optional(),
  note: z.string().optional(),
});

const defaultValues: CustomerFormSchemaType = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  taxId: '',
  citizenId: '',
  note: '',
};

type Props = {
  open: boolean;
  onClose: () => void;
  currentCustomer?: ICustomer | null;
  onSuccess: (customer: ICustomer) => void;
};

export function CustomerFormDialog({ open, onClose, currentCustomer, onSuccess }: Props) {
  const methods = useForm({
    resolver: zodResolver(CustomerFormSchema),
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
      currentCustomer
        ? {
            name: currentCustomer.name,
            contactPerson: currentCustomer.contactPerson ?? '',
            phone: currentCustomer.phone ?? '',
            email: currentCustomer.email ?? '',
            address: currentCustomer.address ?? '',
            taxId: currentCustomer.taxId ?? '',
            citizenId: currentCustomer.citizenId ?? '',
            note: currentCustomer.note ?? '',
          }
        : defaultValues
    );
  }, [open, currentCustomer, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const customer = currentCustomer
        ? await updateCustomer(currentCustomer.id, data)
        : await createCustomer(data);

      toast.success(currentCustomer ? 'แก้ไขข้อมูลลูกค้าแล้ว' : 'เพิ่มลูกค้าใหม่แล้ว');
      onSuccess(customer);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{currentCustomer ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้าใหม่'}</DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Field.Text name="name" label="ชื่อลูกค้า / บริษัท" />
            <Field.Text name="contactPerson" label="ผู้ติดต่อ" />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5 }}>
              <Field.Text name="phone" label="เบอร์โทร" />
              <Field.Text name="email" label="อีเมล" />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5 }}>
              <Field.Text name="citizenId" label="เลขบัตรประชาชน" />
              <Field.Text name="taxId" label="เลขประจำตัวผู้เสียภาษี" />
            </Box>
            <Field.Text name="address" label="ที่อยู่" multiline rows={2} />
            <Field.Text name="note" label="หมายเหตุ" multiline rows={2} />
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
