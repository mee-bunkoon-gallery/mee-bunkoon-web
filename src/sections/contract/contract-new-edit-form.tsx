'use client';

import type { IContract } from 'src/types/contract';
import type { IEventType } from 'src/types/event-type';
import type { ICompanyProfile } from 'src/types/settings';
import type { ICustomer, IQuotation } from 'src/types/quotation';

import * as z from 'zod';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, Controller, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ensureHtmlContent } from 'src/components/editor';
import { LoadingScreen } from 'src/components/loading-screen';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { getCustomers } from 'src/sections/customer/customer-api';
import { getQuotations } from 'src/sections/quotation/quotation-api';
import { getEventTypes } from 'src/sections/event-type/event-type-api';
import { getCompanyProfile } from 'src/sections/settings/settings-api';

import { ContractPdfDocument } from './contract-pdf-document';
import { createContract, updateContract } from './contract-api';
import { MentionTextField } from './contract-mention-text-field';
import { ContractMentionExtension } from './contract-mention-extension';
import {
  parseContractClauses,
  CONTRACT_MENTION_FIELDS,
  DEFAULT_CONTRACT_CLAUSES,
  stringifyContractClauses,
  createEmptyContractClause,
} from './contract-clauses';

// ----------------------------------------------------------------------

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

// ----------------------------------------------------------------------

const STATUS_OPTIONS: { value: IContract['status']; label: string }[] = [
  { value: 'draft', label: 'ฉบับร่าง' },
  { value: 'signed', label: 'ลงนามแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
];

export type ContractFormSchemaType = z.infer<typeof ContractFormSchema>;

export const ContractFormSchema = z.object({
  contractName: z.string().optional(),
  placeOfExecution: z.string().optional(),
  quotation: z.object({ id: z.string(), quoteNo: z.string(), total: z.number() }).nullable(),
  customer: schemaUtils.nullableInput(z.object({ id: z.string(), name: z.string() }), {
    error: 'กรุณาเลือกลูกค้า',
  }),
  contractDate: z.string().min(1, { error: 'กรุณาเลือกวันที่ทำสัญญา' }),
  eventType: z.string().optional(),
  eventTypeId: z.string().nullable(),
  eventDate: z.string().nullable(),
  eventTime: z.string().optional(),
  eventLocation: z.string().optional(),
  scopeOfWork: z.string().optional(),
  totalAmount: z.coerce.number().min(0, { error: 'มูลค่าสัญญาต้องไม่ติดลบ' }),
  depositAmount: z.coerce.number().min(0, { error: 'เงินมัดจำต้องไม่ติดลบ' }),
  paymentTerms: z.string().optional(),
  termsConditions: z.array(z.object({ id: z.string(), title: z.string(), body: z.string() })),
  status: z.enum(['draft', 'signed', 'cancelled']),
  note: z.string().optional(),
});

function toDefaultValues(
  contract?: IContract | null,
  sourceQuotation?: IQuotation | null,
  duplicateContract?: IContract | null
): ContractFormSchemaType {
  if (contract) {
    return {
      contractName: contract.contractName ?? '',
      placeOfExecution: contract.placeOfExecution ?? '',
      quotation: contract.quotation
        ? { id: contract.quotation.id, quoteNo: contract.quotation.quoteNo, total: contract.quotation.total }
        : null,
      customer: contract.customer
        ? { id: contract.customer.id, name: contract.customer.name }
        : null,
      contractDate: dayjs(contract.contractDate).format(),
      eventType: contract.eventType ?? '',
      eventTypeId: contract.eventTypeId ?? null,
      eventDate: contract.eventDate ? dayjs(contract.eventDate).format() : null,
      eventTime: contract.eventTime ?? '',
      eventLocation: contract.eventLocation ?? '',
      scopeOfWork: ensureHtmlContent(contract.scopeOfWork ?? ''),
      totalAmount: contract.totalAmount,
      depositAmount: contract.depositAmount,
      paymentTerms: contract.paymentTerms ?? '',
      termsConditions: parseContractClauses(contract.termsConditions),
      status: contract.status,
      note: contract.note ?? '',
    };
  }

  if (duplicateContract) {
    return {
      contractName: duplicateContract.contractName ?? '',
      placeOfExecution: duplicateContract.placeOfExecution ?? '',
      quotation: null,
      customer: null,
      contractDate: dayjs().format(),
      eventType: duplicateContract.eventType ?? '',
      eventTypeId: duplicateContract.eventTypeId ?? null,
      eventDate: duplicateContract.eventDate ? dayjs(duplicateContract.eventDate).format() : null,
      eventTime: duplicateContract.eventTime ?? '',
      eventLocation: duplicateContract.eventLocation ?? '',
      scopeOfWork: ensureHtmlContent(duplicateContract.scopeOfWork ?? ''),
      totalAmount: duplicateContract.totalAmount,
      depositAmount: duplicateContract.depositAmount,
      paymentTerms: duplicateContract.paymentTerms ?? '',
      termsConditions: duplicateContract.termsConditions
        ? parseContractClauses(duplicateContract.termsConditions)
        : DEFAULT_CONTRACT_CLAUSES,
      status: 'draft',
      note: duplicateContract.note ?? '',
    };
  }

  if (sourceQuotation) {
    const scopeOfWork = sourceQuotation.items
      .map((item) => `${item.description} (${item.quantity} ${item.unit ?? ''})`.trim())
      .join('\n');

    return {
      contractName: '',
      placeOfExecution: '',
      quotation: { id: sourceQuotation.id, quoteNo: sourceQuotation.quoteNo, total: sourceQuotation.total },
      customer: sourceQuotation.customer
        ? { id: sourceQuotation.customer.id, name: sourceQuotation.customer.name }
        : null,
      contractDate: dayjs().format(),
      eventType: '',
      eventTypeId: null,
      eventDate: null,
      eventTime: '',
      eventLocation: '',
      scopeOfWork: ensureHtmlContent(scopeOfWork),
      totalAmount: sourceQuotation.total,
      depositAmount: 0,
      paymentTerms: sourceQuotation.paymentTerms ?? '',
      termsConditions: DEFAULT_CONTRACT_CLAUSES,
      status: 'draft',
      note: '',
    };
  }

  return {
    contractName: '',
    placeOfExecution: '',
    quotation: null,
    customer: null,
    contractDate: dayjs().format(),
    eventType: '',
    eventTypeId: null,
    eventDate: null,
    eventTime: '',
    eventLocation: '',
    scopeOfWork: '',
    totalAmount: 0,
    depositAmount: 0,
    paymentTerms: '',
    termsConditions: DEFAULT_CONTRACT_CLAUSES,
    status: 'draft',
    note: '',
  };
}

type Props = {
  currentContract?: IContract | null;
  sourceQuotation?: IQuotation | null;
  duplicateContract?: IContract | null;
};

export function ContractNewEditForm({
  currentContract,
  sourceQuotation,
  duplicateContract,
}: Props) {
  const router = useRouter();

  const previewDialog = useBoolean();

  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [quotations, setQuotations] = useState<IQuotation[]>([]);
  const [eventTypes, setEventTypes] = useState<IEventType[]>([]);
  const [companyProfile, setCompanyProfile] = useState<ICompanyProfile | null>(null);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(() => toast.error('โหลดรายชื่อลูกค้าไม่สำเร็จ'));
    getQuotations()
      .then(setQuotations)
      .catch(() => toast.error('โหลดรายการใบเสนอราคาไม่สำเร็จ'));
    getEventTypes()
      .then(setEventTypes)
      .catch(() => toast.error('โหลดรายการประเภทงานไม่สำเร็จ'));
    getCompanyProfile()
      .then(setCompanyProfile)
      .catch(() => {});
  }, []);

  const methods = useForm({
    resolver: zodResolver(ContractFormSchema),
    defaultValues: toDefaultValues(currentContract, sourceQuotation, duplicateContract),
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const {
    fields: clauseFields,
    append: appendClause,
    remove: removeClause,
    move: moveClause,
  } = useFieldArray({ control, name: 'termsConditions' });

  useEffect(() => {
    reset(toDefaultValues(currentContract, sourceQuotation, duplicateContract));
  }, [currentContract, sourceQuotation, duplicateContract, reset]);

  const watchedValues = useWatch({ control });

  const previewContract: IContract | null = watchedValues.customer
    ? {
        id: currentContract?.id ?? 'preview',
        contractNo: currentContract?.contractNo ?? 'ฉบับร่าง (ยังไม่บันทึก)',
        contractName: watchedValues.contractName ?? null,
        placeOfExecution: watchedValues.placeOfExecution ?? null,
        quotationId: watchedValues.quotation?.id ?? null,
        quotation: watchedValues.quotation
          ? {
              id: watchedValues.quotation.id ?? '',
              quoteNo: watchedValues.quotation.quoteNo ?? '',
              total: watchedValues.quotation.total ?? 0,
            }
          : null,
        customerId: watchedValues.customer.id ?? '',
        customer: customers.find((c) => c.id === watchedValues.customer?.id) ?? null,
        contractDate: watchedValues.contractDate
          ? dayjs(watchedValues.contractDate).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD'),
        eventType: watchedValues.eventType ?? null,
        eventTypeId: watchedValues.eventTypeId ?? null,
        eventDate: watchedValues.eventDate
          ? dayjs(watchedValues.eventDate).format('YYYY-MM-DD')
          : null,
        eventTime: watchedValues.eventTime ?? null,
        eventLocation: watchedValues.eventLocation ?? null,
        scopeOfWork: watchedValues.scopeOfWork ?? null,
        totalAmount: Number(watchedValues.totalAmount) || 0,
        depositAmount: Number(watchedValues.depositAmount) || 0,
        paymentTerms: watchedValues.paymentTerms ?? null,
        termsConditions: stringifyContractClauses(
          (watchedValues.termsConditions ?? []).map((clause) => ({
            id: clause?.id ?? '',
            title: clause?.title ?? '',
            body: clause?.body ?? '',
          }))
        ),
        status: watchedValues.status ?? 'draft',
        note: watchedValues.note ?? null,
        issuerSignatureUrl: currentContract?.issuerSignatureUrl ?? null,
        customerSignatureUrl: currentContract?.customerSignatureUrl ?? null,
        createdAt: currentContract?.createdAt ?? new Date().toISOString(),
        updatedAt: currentContract?.updatedAt ?? new Date().toISOString(),
      }
    : null;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        quotationId: data.quotation?.id ?? null,
        contractName: data.contractName,
        placeOfExecution: data.placeOfExecution,
        customerId: data.customer!.id,
        contractDate: dayjs(data.contractDate).format('YYYY-MM-DD'),
        eventType: data.eventType,
        eventTypeId: data.eventTypeId,
        eventDate: data.eventDate ? dayjs(data.eventDate).format('YYYY-MM-DD') : null,
        eventTime: data.eventTime,
        eventLocation: data.eventLocation,
        scopeOfWork: data.scopeOfWork,
        totalAmount: data.totalAmount,
        depositAmount: data.depositAmount,
        paymentTerms: data.paymentTerms,
        termsConditions: stringifyContractClauses(data.termsConditions),
        status: data.status,
        note: data.note,
      };

      const contract = currentContract
        ? await updateContract(currentContract.id, payload)
        : await createContract(payload);

      toast.success(currentContract ? 'แก้ไขสัญญาแล้ว' : 'สร้างสัญญาแล้ว');
      // router.push(paths.dashboard.contract.details(contract.id));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <Field.Text
                  name="contractName"
                  label="ชื่อสัญญา"
                  placeholder="เช่น สัญญาจ้างจัดเลี้ยงนอกสถานที่"
                />
              </Grid>

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
                      disabled={!!watchedValues.quotation}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="ลูกค้า (ผู้ว่าจ้าง)"
                          error={!!error}
                          helperText={
                            error?.message ||
                            (watchedValues.quotation
                              ? 'ลูกค้าถูกกำหนดตามใบเสนอราคาที่เลือก ลบการอ้างอิงเพื่อแก้ไข'
                              : undefined)
                          }
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="quotation"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={quotations.map((q) => ({ id: q.id, quoteNo: q.quoteNo, total: q.total }))}
                      getOptionLabel={(option) => option.quoteNo}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={field.value}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue);

                        const selectedQuotation = newValue
                          ? quotations.find((q) => q.id === newValue.id)
                          : null;

                        if (selectedQuotation?.customer) {
                          setValue(
                            'customer',
                            { id: selectedQuotation.customer.id, name: selectedQuotation.customer.name },
                            { shouldValidate: true }
                          );
                        }
                      }}
                      renderInput={(params) => <TextField {...params} label="อ้างอิงใบเสนอราคา" />}
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
                <Field.Text name="placeOfExecution" label="ทำขึ้นที่" placeholder="เช่น สำนักงานใหญ่ บริษัท..." />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Field.DatePicker name="contractDate" label="วันที่ทำสัญญา" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="eventType"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={eventTypes}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={eventTypes.find((item) => item.name === field.value) ?? null}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue?.name ?? '');
                        setValue('eventTypeId', newValue?.id ?? null);
                      }}
                      renderInput={(params) => <TextField {...params} label="ประเภทงาน" />}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Field.DatePicker name="eventDate" label="วันที่จัดงาน" />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Field.Text name="eventTime" label="ช่วงเวลา (เช่น 09:00 - 17:00)" />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Field.Text name="eventLocation" label="สถานที่จัดงาน" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}
                >
                  ขอบเขตงาน / รายละเอียดสัญญา
                </Typography>
                <Field.Editor
                  name="scopeOfWork"
                  placeholder="พิมพ์รายละเอียดข้อตกลง เช่น คำนำสัญญา ขอบเขตงาน หรือเงื่อนไขการชำระเงิน พิมพ์ @ เพื่อแทรกคำว่า ผู้ว่าจ้าง หรือ ผู้รับจ้าง"
                  extraExtensions={[ContractMentionExtension]}
                  sx={{ minHeight: 200 }}
                />
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ mt: 3, p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                ข้อตกลงและเงื่อนไข
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {clauseFields.map((clauseField, index) => (
                  <Card key={clauseField.id} variant="outlined" sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="subtitle2">ข้อ {index + 1}</Typography>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          type="button"
                          size="small"
                          disabled={index === 0}
                          onClick={() => moveClause(index, index - 1)}
                        >
                          <Iconify icon="eva:arrow-upward-fill" width={18} />
                        </IconButton>
                        <IconButton
                          type="button"
                          size="small"
                          disabled={index === clauseFields.length - 1}
                          onClick={() => moveClause(index, index + 1)}
                        >
                          <Iconify icon="eva:arrow-downward-fill" width={18} />
                        </IconButton>
                        <IconButton
                          type="button"
                          size="small"
                          color="error"
                          onClick={() => removeClause(index)}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Controller
                      name={`termsConditions.${index}.title`}
                      control={control}
                      render={({ field }) => (
                        <MentionTextField
                          {...field}
                          label="หัวข้อ"
                          placeholder="เช่น การจัดเลี้ยงนอกสถานที่"
                          mentionOptions={CONTRACT_MENTION_FIELDS}
                          sx={{ mb: 2 }}
                        />
                      )}
                    />

                    <Typography
                      variant="caption"
                      sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}
                    >
                      รายละเอียด
                    </Typography>
                    <Field.Editor
                      name={`termsConditions.${index}.body`}
                      placeholder="พิมพ์รายละเอียดของข้อนี้ พิมพ์ @ เพื่อแทรกคำว่า ผู้ว่าจ้าง หรือ ผู้รับจ้าง"
                      extraExtensions={[ContractMentionExtension]}
                      sx={{ minHeight: 160 }}
                    />
                  </Card>
                ))}
              </Box>

              <Button
                type="button"
                size="small"
                sx={{ mt: clauseFields.length ? 2 : 0 }}
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => appendClause(createEmptyContractClause())}
              >
                เพิ่มข้อ
              </Button>
            </Box>

            <Field.Text name="note" label="หมายเหตุ" multiline rows={2} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, position: 'sticky', top: 96 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Field.Text name="totalAmount" label="มูลค่าสัญญา (บาท)" type="number" />
              <Field.Text name="depositAmount" label="เงินมัดจำ (บาท)" type="number" />
            </Box>

            <Button
              fullWidth
              type="button"
              variant="outlined"
              size="large"
              disabled={!previewContract}
              startIcon={<Iconify icon="solar:eye-bold" />}
              onClick={previewDialog.onTrue}
              sx={{ mt: 3 }}
            >
              พรีวิว PDF
            </Button>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{ mt: 1.5 }}
            >
              {currentContract ? 'บันทึกการแก้ไข' : 'สร้างสัญญา'}
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
          พรีวิว PDF
          <IconButton type="button" onClick={previewDialog.onFalse}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {previewDialog.value && previewContract && (
            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
              <ContractPdfDocument
                contract={previewContract}
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
