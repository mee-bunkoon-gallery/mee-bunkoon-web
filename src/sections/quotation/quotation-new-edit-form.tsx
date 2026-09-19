'use client';

import type { IQuotation, IServiceItem } from 'src/types/quotation';
import type { IPromotionPackage } from 'src/types/promotion-package';

import * as z from 'zod';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useBoolean } from 'minimal-shared/hooks';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, Controller, useFieldArray } from 'react-hook-form';
import {
  RiEyeLine,
  RiAddLine,
  RiGiftFill,
  RiCloseLine,
  RiSave3Line,
  RiDeleteBin6Fill,
} from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fBaht } from 'src/utils/format-number';

import { CONFIG } from 'src/global-config';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useCustomersQuery } from 'src/sections/customer/customer-queries';
import { useServiceItemsQuery } from 'src/sections/service/service-queries';
import { useCompanyProfileQuery } from 'src/sections/settings/settings-queries';
import { usePromotionPackagesQuery } from 'src/sections/promotion-package/promotion-package-queries';

import { QuotationPdfDocument } from './quotation-pdf-document';
import { getQuotation, getNextQuotationNo, saveQuotationAttachments } from './quotation-api';
import { useCreateQuotationMutation, useUpdateQuotationMutation } from './quotation-queries';

// ----------------------------------------------------------------------

const STATUS_OPTIONS: { value: IQuotation['status']; label: string }[] = [
  { value: 'draft', label: 'ฉบับร่าง' },
  { value: 'sent', label: 'ส่งแล้ว' },
  { value: 'accepted', label: 'ลูกค้ายอมรับ' },
  { value: 'rejected', label: 'ลูกค้าปฏิเสธ' },
];

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

const QuotationItemSchema = z.object({
  serviceItemId: z.string().nullable().optional(),
  promotionPackageId: z.string().nullable().optional(),
  promotionPackageDiscount: z.coerce.number().min(0).optional(),
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
  attachments: z
    .array(z.union([z.instanceof(File), z.string()]))
    .max(10, { error: 'แนบภาพได้ไม่เกิน 10 ภาพ' }),
  items: z.array(QuotationItemSchema).min(1, { error: 'กรุณาเพิ่มอย่างน้อย 1 รายการ' }),
});

const emptyItem = {
  serviceItemId: null,
  promotionPackageId: null,
  promotionPackageDiscount: 0,
  description: '',
  unit: 'รายการ',
  quantity: 1,
  unitPrice: 0,
};

function toDefaultValues(quotation?: IQuotation | null): QuotationFormSchemaType {
  if (!quotation) {
    return {
      customer: null,
      issueDate: dayjs().format(),
      validUntil: null,
      status: 'draft',
      includeVat: false,
      vatRate: 7,
      discount: 0,
      note: '',
      paymentTerms: '',
      attachments: [],
      items: [emptyItem],
    };
  }

  return {
    customer: quotation.customer
      ? { id: quotation.customer.id, name: quotation.customer.name }
      : null,
    issueDate: dayjs(quotation.issueDate).format(),
    validUntil: quotation.validUntil ? dayjs(quotation.validUntil).format() : null,
    status: quotation.status,
    includeVat: quotation.includeVat,
    vatRate: quotation.vatRate,
    discount: quotation.discount,
    note: quotation.note ?? '',
    paymentTerms: quotation.paymentTerms ?? '',
    attachments: quotation.attachmentImageUrls ?? [],
    items: quotation.items.length
      ? quotation.items.map((item) => ({
          serviceItemId: item.serviceItemId,
          promotionPackageId: item.promotionPackageId ?? null,
          promotionPackageDiscount: item.promotionPackageDiscount ?? 0,
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
  const previewDialog = useBoolean();
  const [selectedPackage, setSelectedPackage] = useState<IPromotionPackage | null>(null);
  const [savedQuotation, setSavedQuotation] = useState<IQuotation | null>(null);

  const { data: companyProfile } = useCompanyProfileQuery();
  const { data: nextQuotationNo = 'กำลังสร้างเลข...' } = useQuery({
    queryKey: ['quotations', 'next-quotation-no'],
    queryFn: getNextQuotationNo,
  });
  const { data: customers = [], isError: isCustomersError } = useCustomersQuery();
  const { data: serviceItems = [], isError: isServiceItemsError } = useServiceItemsQuery();
  const { data: promotionPackages = [], isError: isPackagesError } = usePromotionPackagesQuery();
  const createMutation = useCreateQuotationMutation();
  const updateMutation = useUpdateQuotationMutation();

  useEffect(() => {
    if (isCustomersError) toast.error('โหลดรายชื่อลูกค้าไม่สำเร็จ');
  }, [isCustomersError]);

  useEffect(() => {
    if (isServiceItemsError) toast.error('โหลดรายการบริการไม่สำเร็จ');
  }, [isServiceItemsError]);

  useEffect(() => {
    if (isPackagesError) toast.error('โหลดแพ็กเกจ/โปรโมชั่นไม่สำเร็จ');
  }, [isPackagesError]);

  const methods = useForm({
    resolver: zodResolver(QuotationFormSchema),
    defaultValues: toDefaultValues(currentQuotation),
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    setSavedQuotation(null);
    reset(toDefaultValues(currentQuotation));
  }, [currentQuotation, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const values = useWatch({ control }) as QuotationFormSchemaType;

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

  const activeQuotation = savedQuotation ?? currentQuotation;
  const previewAttachmentUrls = useMemo(
    () =>
      values.attachments.map((attachment) =>
        typeof attachment === 'string' ? attachment : URL.createObjectURL(attachment)
      ),
    [values.attachments]
  );

  useEffect(
    () => () => {
      previewAttachmentUrls.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    },
    [previewAttachmentUrls]
  );

  const previewQuotation: IQuotation = {
    id: activeQuotation?.id ?? 'preview',
    quoteNo: activeQuotation?.quoteNo ?? nextQuotationNo,
    customerId: values.customer?.id ?? '',
    customer: customers.find((customer) => customer.id === values.customer?.id) ?? null,
    issueDate: values.issueDate
      ? dayjs(values.issueDate).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD'),
    validUntil: values.validUntil ? dayjs(values.validUntil).format('YYYY-MM-DD') : null,
    status: values.status,
    includeVat: values.includeVat,
    vatRate: Number(values.vatRate) || 0,
    discount: Number(values.discount) || 0,
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    total: totals.total,
    note: values.note ?? null,
    paymentTerms: values.paymentTerms ?? null,
    issuerSignatureUrl: activeQuotation?.issuerSignatureUrl ?? null,
    customerSignatureUrl: activeQuotation?.customerSignatureUrl ?? null,
    issuerSignedAt: activeQuotation?.issuerSignedAt ?? null,
    customerSignedAt: activeQuotation?.customerSignedAt ?? null,
    attachmentImageUrls: previewAttachmentUrls,
    items: values.items.map((item, index) => ({
      id: activeQuotation?.items[index]?.id,
      serviceItemId: item.serviceItemId ?? null,
      promotionPackageId: item.promotionPackageId ?? null,
      promotionPackageDiscount: Number(item.promotionPackageDiscount) || 0,
      description: item.description || '-',
      unit: item.unit || null,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      amount: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    })),
    createdAt: activeQuotation?.createdAt ?? new Date().toISOString(),
    updatedAt: activeQuotation?.updatedAt ?? new Date().toISOString(),
  };

  const saveQuotation = async (data: QuotationFormSchemaType, stayOnPage: boolean) => {
    try {
      const payload = {
        customerId: data.customer!.id,
        issueDate: dayjs(data.issueDate).format('YYYY-MM-DD'),
        validUntil: data.validUntil ? dayjs(data.validUntil).format('YYYY-MM-DD') : null,
        status: stayOnPage ? ('draft' as const) : data.status,
        includeVat: data.includeVat,
        vatRate: data.vatRate,
        discount: data.discount,
        note: data.note,
        paymentTerms: data.paymentTerms,
        items: data.items.map((item) => ({
          serviceItemId: item.serviceItemId,
          promotionPackageId: item.promotionPackageId,
          promotionPackageDiscount: item.promotionPackageDiscount,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const quotation = activeQuotation
        ? await updateMutation.mutateAsync({ id: activeQuotation.id, input: payload })
        : await createMutation.mutateAsync(payload);

      await saveQuotationAttachments(quotation.id, data.attachments);

      if (stayOnPage) {
        const refreshedQuotation = await getQuotation(quotation.id);
        setSavedQuotation(refreshedQuotation);
        reset(toDefaultValues(refreshedQuotation));
        toast.success('บันทึกแบบร่างแล้ว');
        return;
      }

      toast.success(activeQuotation ? 'แก้ไขใบเสนอราคาแล้ว' : 'สร้างใบเสนอราคาแล้ว');
      router.push(paths.dashboard.quotation.details(quotation.id));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  const onSubmit = handleSubmit((data) => saveQuotation(data, false));
  const onSaveDraft = handleSubmit((data) => saveQuotation(data, true));

  const handlePickServiceItem = (index: number, serviceItem: IServiceItem) => {
    methods.setValue(`items.${index}.description`, serviceItem.name);
    methods.setValue(`items.${index}.unit`, serviceItem.unit);
    methods.setValue(`items.${index}.unitPrice`, serviceItem.unitPrice);
  };

  const availablePackages = promotionPackages.filter((item) => {
    const today = dayjs();
    return (
      item.active &&
      !values.items.some((quotationItem) => quotationItem.promotionPackageId === item.id) &&
      (!item.startDate || !today.isBefore(dayjs(item.startDate), 'day')) &&
      (!item.endDate || !today.isAfter(dayjs(item.endDate), 'day'))
    );
  });

  const handleAddPackage = () => {
    if (!selectedPackage) return;
    const normalPrice = selectedPackage.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const packageDiscount = Math.max(normalPrice - selectedPackage.promotionPrice, 0);
    const packageItems = selectedPackage.items.map((item, index) => ({
      serviceItemId: item.serviceItemId,
      promotionPackageId: selectedPackage.id,
      promotionPackageDiscount: index === 0 ? packageDiscount : 0,
      description: item.serviceItem.name,
      unit: item.serviceItem.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));
    const currentItems = methods.getValues('items');
    if (currentItems.length === 1 && !currentItems[0].description) {
      remove(0);
    }
    append(packageItems);
    methods.setValue('discount', Number(methods.getValues('discount') || 0) + packageDiscount);
    toast.success(`เพิ่มแพ็กเกจ “${selectedPackage.name}” แล้ว`);
    setSelectedPackage(null);
  };

  const handleRemovePackage = (promotionPackageId: string) => {
    const packageItemIndexes = values.items.reduce<number[]>((indexes, item, index) => {
      if (item.promotionPackageId === promotionPackageId) indexes.push(index);
      return indexes;
    }, []);
    const packageDiscount = packageItemIndexes.reduce(
      (sum, index) => sum + Number(values.items[index].promotionPackageDiscount || 0),
      0
    );

    remove(packageItemIndexes);
    methods.setValue(
      'discount',
      Math.max(Number(methods.getValues('discount') || 0) - packageDiscount, 0)
    );
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

            <Box sx={{ px: 3, pt: 1 }}>
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ sm: 'center' }}
                >
                  <Autocomplete
                    fullWidth
                    options={availablePackages}
                    value={selectedPackage}
                    getOptionLabel={(option) => `${option.name} · ${fBaht(option.promotionPrice)}`}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_event, value) => setSelectedPackage(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="เลือกแพ็กเกจ/โปรโมชั่น"
                        placeholder="ค้นหาแพ็กเกจ"
                      />
                    )}
                  />
                  <Button
                    variant="contained"
                    disabled={!selectedPackage}
                    onClick={handleAddPackage}
                    startIcon={<RiAddLine />}
                    sx={{ flexShrink: 0, minHeight: 54 }}
                  >
                    เพิ่มแพ็กเกจ
                  </Button>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 1, color: 'text.secondary' }}
                >
                  รายการในแพ็กเกจจะถูกเพิ่มด้านล่าง และยังเพิ่มรายการบริการอื่นได้ตามปกติ
                </Typography>
              </Card>
            </Box>

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
                      const promotionPackageId = values.items?.[index]?.promotionPackageId;
                      const promotionPackage = promotionPackages.find(
                        (item) => item.id === promotionPackageId
                      );

                      if (promotionPackageId) {
                        const isFirstPackageItem =
                          values.items.findIndex(
                            (item) => item.promotionPackageId === promotionPackageId
                          ) === index;

                        if (!isFirstPackageItem) return null;

                        const packageItems = values.items.filter(
                          (item) => item.promotionPackageId === promotionPackageId
                        );
                        const packageNormalPrice = packageItems.reduce(
                          (sum, item) =>
                            sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
                          0
                        );
                        const packageDiscount = packageItems.reduce(
                          (sum, item) => sum + Number(item.promotionPackageDiscount || 0),
                          0
                        );
                        const packagePrice = packageNormalPrice - packageDiscount;

                        return (
                          <TableRow key={field.id} sx={{ bgcolor: 'background.neutral' }}>
                            <TableCell sx={{ py: 2.5 }}>
                              <Stack spacing={1}>
                                <Chip
                                  size="small"
                                  color="primary"
                                  variant="soft"
                                  icon={<RiGiftFill />}
                                  label={`แพ็กเกจ: ${promotionPackage?.name ?? 'แพ็กเกจ/โปรโมชั่น'}`}
                                  sx={{ alignSelf: 'flex-start' }}
                                />
                                {packageItems.map((item, packageItemIndex) => (
                                  <Typography
                                    key={`${promotionPackageId}-${packageItemIndex}`}
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {item.description} × {item.quantity} {item.unit}
                                  </Typography>
                                ))}
                              </Stack>
                            </TableCell>
                            <TableCell>แพ็กเกจ</TableCell>
                            <TableCell align="right">1</TableCell>
                            <TableCell align="right">{fBaht(packagePrice)}</TableCell>
                            <TableCell align="right">{fBaht(packagePrice)}</TableCell>
                            <TableCell>
                              <IconButton
                                color="error"
                                onClick={() => handleRemovePackage(promotionPackageId)}
                              >
                                <RiDeleteBin6Fill />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      }

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
                              <RiDeleteBin6Fill />
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
              <Button size="small" startIcon={<RiAddLine />} onClick={() => append(emptyItem)}>
                เพิ่มรายการ
              </Button>
            </Box>
          </Card>

          <Card sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              เอกสารเพิ่มเติม
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              แนบภาพประกอบได้หลายภาพ โดยแต่ละภาพจะแสดงเป็นหน้าใหม่ในไฟล์ PDF
            </Typography>
            <Controller
              name="attachments"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Upload
                  multiple
                  value={field.value}
                  accept={{ 'image/png': [], 'image/jpeg': [] }}
                  error={!!error}
                  helperText={
                    error?.message ?? 'รองรับ PNG และ JPG สูงสุด 10 ภาพ ภาพละไม่เกิน 10MB'
                  }
                  onDrop={(acceptedFiles) =>
                    field.onChange([...field.value, ...acceptedFiles].slice(0, 10))
                  }
                  onRemove={(file) =>
                    field.onChange(field.value.filter((item: File | string) => item !== file))
                  }
                  onRemoveAll={() => field.onChange([])}
                />
              )}
            />
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
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                เลขที่ใบเสนอราคา
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.25, color: 'primary.main' }}>
                {activeQuotation?.quoteNo ?? nextQuotationNo}
              </Typography>
            </Box>

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
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
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
              type="button"
              variant="outlined"
              size="large"
              startIcon={<RiEyeLine />}
              onClick={previewDialog.onTrue}
              sx={{ mt: 3 }}
            >
              ดูตัวอย่าง PDF
            </Button>

            <Button
              fullWidth
              type="button"
              variant="soft"
              size="large"
              loading={isSubmitting}
              startIcon={<RiSave3Line />}
              onClick={onSaveDraft}
              sx={{ mt: 1.5 }}
            >
              บันทึกแบบร่าง
            </Button>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{ mt: 1.5 }}
            >
              {activeQuotation ? 'บันทึกและดูใบเสนอราคา' : 'สร้างและดูใบเสนอราคา'}
            </Button>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        fullWidth
        maxWidth="md"
        open={previewDialog.value}
        onClose={previewDialog.onFalse}
        slotProps={{ paper: { sx: { height: '90vh' } } }}
      >
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}
        >
          พรีวิว PDF — {previewQuotation.quoteNo}
          <IconButton type="button" onClick={previewDialog.onFalse} aria-label="ปิดพรีวิว PDF">
            <RiCloseLine />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {previewDialog.value && (
            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
              <QuotationPdfDocument
                quotation={previewQuotation}
                companyProfile={companyProfile}
                companyName={CONFIG.appName}
              />
            </PDFViewer>
          )}
        </DialogContent>
      </Dialog>
    </Form>
  );
}
