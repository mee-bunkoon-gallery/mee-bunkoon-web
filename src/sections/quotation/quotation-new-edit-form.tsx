'use client';

import type { ICustomer, IQuotation, IServiceItem } from 'src/types/quotation';

import * as z from 'zod';
import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fBaht } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { getCustomers } from 'src/sections/customer/customer-api';
import { getServiceItems } from 'src/sections/service/service-api';

import { createQuotation, updateQuotation } from './quotation-api';

// ----------------------------------------------------------------------

const STATUS_OPTIONS: { value: IQuotation['status']; label: string }[] = [
  { value: 'draft', label: 'ฉบับร่าง' },
  { value: 'sent', label: 'ส่งแล้ว' },
  { value: 'accepted', label: 'ลูกค้ายอมรับ' },
  { value: 'rejected', label: 'ลูกค้าปฏิเสธ' },
];

const QuotationItemSchema = z.object({
  serviceItemId: z.string().nullable().optional(),
  description: z.string().min(1, { error: 'กรุณากรอกรายละเอียด' }),
  unit: z.string().optional(),
  quantity: z.coerce.number({ error: 'กรุณากรอกจำนวน' }).positive({ error: 'จำนวนต้องมากกว่า 0' }),
  unitPrice: z.coerce.number({ error: 'กรุณากรอกราคา' }).min(0, { error: 'ราคาต้องไม่ติดลบ' }),
});

export type QuotationFormSchemaType = z.infer<typeof QuotationFormSchema>;

export const QuotationFormSchema = z.object({
  customer: schemaUtils.nullableInput(z.object({ id: z.string(), name: z.string() }), {
    error: 'กรุณาเลือกลูกค้า',
  }),
  issueDate: z.string().min(1, { error: 'กรุณาเลือกวันที่ออกใบเสนอราคา' }),
  validUntil: z.string().nullable(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected']),
  includeVat: z.boolean(),
  vatRate: z.coerce.number().min(0).max(100),
  discount: z.coerce.number().min(0, { error: 'ส่วนลดต้องไม่ติดลบ' }),
  note: z.string().optional(),
  paymentTerms: z.string().optional(),
  items: z.array(QuotationItemSchema).min(1, { error: 'กรุณาเพิ่มอย่างน้อย 1 รายการ' }),
});

const emptyItem = { serviceItemId: null, description: '', unit: 'รายการ', quantity: 1, unitPrice: 0 };

function toDefaultValues(quotation?: IQuotation | null): QuotationFormSchemaType {
  if (!quotation) {
    return {
      customer: null,
      issueDate: dayjs().format(),
      validUntil: null,
      status: 'draft',
      includeVat: true,
      vatRate: 7,
      discount: 0,
      note: '',
      paymentTerms: '',
      items: [emptyItem],
    };
  }

  return {
    customer: quotation.customer ? { id: quotation.customer.id, name: quotation.customer.name } : null,
    issueDate: dayjs(quotation.issueDate).format(),
    validUntil: quotation.validUntil ? dayjs(quotation.validUntil).format() : null,
    status: quotation.status,
    includeVat: quotation.includeVat,
    vatRate: quotation.vatRate,
    discount: quotation.discount,
    note: quotation.note ?? '',
    paymentTerms: quotation.paymentTerms ?? '',
    items: quotation.items.length
      ? quotation.items.map((item) => ({
          serviceItemId: item.serviceItemId,
          description: item.description,
          unit: item.unit ?? '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      : [emptyItem],
  };
}

type Props = {
  currentQuotation?: IQuotation | null;
};

export function QuotationNewEditForm({ currentQuotation }: Props) {
  const router = useRouter();

  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [serviceItems, setServiceItems] = useState<IServiceItem[]>([]);

  useEffect(() => {
    getCustomers().then(setCustomers).catch(() => toast.error('โหลดรายชื่อลูกค้าไม่สำเร็จ'));
    getServiceItems().then(setServiceItems).catch(() => toast.error('โหลดรายการบริการไม่สำเร็จ'));
  }, []);

  const methods = useForm({
    resolver: zodResolver(QuotationFormSchema),
    defaultValues: toDefaultValues(currentQuotation),
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(toDefaultValues(currentQuotation));
  }, [currentQuotation, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const values = watch() as QuotationFormSchemaType;

  const totals = useMemo(() => {
    const subtotal = values.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
    const taxable = Math.max(subtotal - (Number(values.discount) || 0), 0);
    const vatAmount = values.includeVat ? (taxable * (Number(values.vatRate) || 0)) / 100 : 0;
    const total = taxable + vatAmount;

    return { subtotal, vatAmount, total };
  }, [values.items, values.discount, values.includeVat, values.vatRate]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        customerId: data.customer!.id,
        issueDate: dayjs(data.issueDate).format('YYYY-MM-DD'),
        validUntil: data.validUntil ? dayjs(data.validUntil).format('YYYY-MM-DD') : null,
        status: data.status,
        includeVat: data.includeVat,
        vatRate: data.vatRate,
        discount: data.discount,
        note: data.note,
        paymentTerms: data.paymentTerms,
        items: data.items.map((item) => ({
          serviceItemId: item.serviceItemId,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const quotation = currentQuotation
        ? await updateQuotation(currentQuotation.id, payload)
        : await createQuotation(payload);

      toast.success(currentQuotation ? 'แก้ไขใบเสนอราคาแล้ว' : 'สร้างใบเสนอราคาแล้ว');
      router.push(paths.dashboard.quotation.details(quotation.id));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  });

  const handlePickServiceItem = (index: number, serviceItem: IServiceItem) => {
    methods.setValue(`items.${index}.description`, serviceItem.name);
    methods.setValue(`items.${index}.unit`, serviceItem.unit);
    methods.setValue(`items.${index}.unitPrice`, serviceItem.unitPrice);
  };

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
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
                          label="ลูกค้า"
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
                <Field.DatePicker name="issueDate" label="วันที่ออกใบเสนอราคา" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Field.DatePicker name="validUntil" label="ยืนราคาถึงวันที่" />
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardHeader title="รายการ" />

            <TableContainer sx={{ overflow: 'unset', px: 3, pt: 2 }}>
              <Scrollbar>
                <Table sx={{ minWidth: 720 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 240 }}>รายละเอียด</TableCell>
                      <TableCell sx={{ minWidth: 100 }}>หน่วย</TableCell>
                      <TableCell sx={{ minWidth: 100 }} align="right">
                        จำนวน
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }} align="right">
                        ราคาต่อหน่วย
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }} align="right">
                        จำนวนเงิน
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {fields.map((field, index) => {
                      const quantity = Number(values.items?.[index]?.quantity) || 0;
                      const unitPrice = Number(values.items?.[index]?.unitPrice) || 0;

                      return (
                        <TableRow key={field.id}>
                          <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                            <Controller
                              name={`items.${index}.serviceItemId`}
                              control={control}
                              render={({ field: serviceField }) => (
                                <Autocomplete
                                  freeSolo
                                  options={serviceItems}
                                  getOptionLabel={(option) =>
                                    typeof option === 'string' ? option : option.name
                                  }
                                  value={
                                    serviceItems.find((item) => item.id === serviceField.value) ??
                                    null
                                  }
                                  onChange={(_event, newValue) => {
                                    if (newValue && typeof newValue !== 'string') {
                                      serviceField.onChange(newValue.id);
                                      handlePickServiceItem(index, newValue);
                                    } else {
                                      serviceField.onChange(null);
                                    }
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      placeholder="เลือกรายการบริการ หรือพิมพ์เอง"
                                    />
                                  )}
                                  sx={{ mb: 1 }}
                                />
                              )}
                            />
                            <Field.Text
                              name={`items.${index}.description`}
                              placeholder="รายละเอียดรายการ"
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                            <Field.Text name={`items.${index}.unit`} size="small" />
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                            <Field.Text
                              name={`items.${index}.quantity`}
                              type="number"
                              size="small"
                              slotProps={{ htmlInput: { style: { textAlign: 'right' } } }}
                            />
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                            <Field.Text
                              name={`items.${index}.unitPrice`}
                              type="number"
                              size="small"
                              slotProps={{ htmlInput: { style: { textAlign: 'right' } } }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ verticalAlign: 'top', pt: 3.5 }}>
                            {fBaht(quantity * unitPrice)}
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', pt: 1.5 }}>
                            <IconButton
                              color="error"
                              disabled={fields.length === 1}
                              onClick={() => remove(index)}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <Box sx={{ p: 3 }}>
              <Button
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => append(emptyItem)}
              >
                เพิ่มรายการ
              </Button>
            </Box>
          </Card>

          <Card sx={{ mt: 3, p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          
            <Field.Text
              name="paymentTerms"
              label="เงื่อนไขการชำระเงิน"
              multiline
              rows={4}
              helperText="พิมพ์แต่ละเงื่อนไขขึ้นบรรทัดใหม่ จะแสดงเป็นข้อ ๆ ในใบเสนอราคา"
            />

            <Field.Text name="note" label="หมายเหตุ" multiline rows={3} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, position: 'sticky', top: 96 }}>
            <Typography variant="h6" sx={{ mb: 2.5 }}>
              สรุปยอด
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Field.Text name="discount" label="ส่วนลด (บาท)" type="number" />

              <FormControlLabel
                control={
                  <Controller
                    name="includeVat"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                    )}
                  />
                }
                label="คิดภาษีมูลค่าเพิ่ม"
              />

              {values.includeVat && (
                <Field.Text name="vatRate" label="อัตราภาษี (%)" type="number" />
              )}
            </Box>

            <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ยอดรวม
                </Typography>
                <Typography variant="body2">{fBaht(totals.subtotal)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ส่วนลด
                </Typography>
                <Typography variant="body2">-{fBaht(values.discount || 0)}</Typography>
              </Box>

              {values.includeVat && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    ภาษีมูลค่าเพิ่ม ({values.vatRate || 0}%)
                  </Typography>
                  <Typography variant="body2">{fBaht(totals.vatAmount)}</Typography>
                </Box>
              )}

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">ยอดรวมสุทธิ</Typography>
                <Typography variant="subtitle1">{fBaht(totals.total)}</Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{ mt: 3 }}
            >
              {currentQuotation ? 'บันทึกการแก้ไข' : 'สร้างใบเสนอราคา'}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
