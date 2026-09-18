'use client';

import type { IJobQueue } from 'src/types/job-queue';

import * as z from 'zod';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useContractsQuery } from 'src/sections/contract/contract-queries';
import { useCustomersQuery } from 'src/sections/customer/customer-queries';
import { useQuotationsQuery } from 'src/sections/quotation/quotation-queries';
import { useColorThemesQuery } from 'src/sections/color-theme/color-theme-queries';

import { JOB_QUEUE_STATUS_OPTIONS } from './job-queue-status';
import {
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} from './job-queue-queries';

// ----------------------------------------------------------------------

type JobQueueFormValues = {
  title: string;
  jobDescription?: string;
  customer: { id: string; name: string } | null;
  colorThemes: { id: string; name: string }[];
  quotation: { id: string; quoteNo: string } | null;
  contract: { id: string; contractNo: string } | null;
  jobDate: string;
  startTime: string | null;
  endTime: string | null;
  location?: string;
  status: IJobQueue['status'];
  note?: string;
};

const JobQueueFormSchema = z.object({
  title: z.string().min(1, { error: 'กรุณากรอกชื่องาน' }),
  jobDescription: z.string().optional(),
  customer: schemaUtils.nullableInput(z.object({ id: z.string(), name: z.string() }), {
    error: 'กรุณาเลือกลูกค้า',
  }),
  colorThemes: z.array(z.object({ id: z.string(), name: z.string() })),
  quotation: z.object({ id: z.string(), quoteNo: z.string() }).nullable(),
  contract: z.object({ id: z.string(), contractNo: z.string() }).nullable(),
  jobDate: z.string().min(1, { error: 'กรุณาเลือกวันที่' }),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  location: z.string().optional(),
  status: z.enum(['queued', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  note: z.string().optional(),
});

function toDefaultValues(job?: IJobQueue | null, defaultDate?: string): JobQueueFormValues {
  if (job) {
    return {
      title: job.title,
      jobDescription: job.jobDescription ?? '',
      customer: job.customer ? { id: job.customer.id, name: job.customer.name } : null,
      colorThemes:
        job.colorThemes?.map((theme) => ({ id: theme.id, name: theme.name })) ??
        (job.colorTheme ? [{ id: job.colorTheme.id, name: job.colorTheme.name }] : []),
      quotation: null,
      contract: null,
      jobDate: dayjs(job.jobDate).format(),
      startTime: job.startTime ? dayjs(`2000-01-01T${job.startTime}`).format() : null,
      endTime: job.endTime ? dayjs(`2000-01-01T${job.endTime}`).format() : null,
      location: job.location ?? '',
      status: job.status,
      note: job.note ?? '',
    };
  }

  return {
    title: '',
    jobDescription: '',
    customer: null,
    colorThemes: [],
    quotation: null,
    contract: null,
    jobDate: defaultDate ? dayjs(defaultDate).format() : dayjs().format(),
    startTime: null,
    endTime: null,
    location: '',
    status: 'queued',
    note: '',
  };
}

type Props = {
  currentJob?: IJobQueue | null;
  defaultDate?: string | null;
  initialQuotationId?: string | null;
  initialContractId?: string | null;
};

export function JobQueueNewEditForm({
  currentJob,
  defaultDate,
  initialQuotationId,
  initialContractId,
}: Props) {
  const router = useRouter();

  const { data: customers = [], isError: isCustomersError } = useCustomersQuery();
  const { data: quotations = [], isError: isQuotationsError } = useQuotationsQuery();
  const { data: contracts = [], isError: isContractsError } = useContractsQuery();
  const { data: colorThemes = [], isError: isColorThemesError } = useColorThemesQuery();

  const createMutation = useCreateJobMutation();
  const updateMutation = useUpdateJobMutation();
  const deleteMutation = useDeleteJobMutation();

  useEffect(() => {
    if (isCustomersError) toast.error('โหลดรายชื่อลูกค้าไม่สำเร็จ');
  }, [isCustomersError]);

  useEffect(() => {
    if (isQuotationsError) toast.error('โหลดรายการใบเสนอราคาไม่สำเร็จ');
  }, [isQuotationsError]);

  useEffect(() => {
    if (isContractsError) toast.error('โหลดรายการสัญญาไม่สำเร็จ');
  }, [isContractsError]);

  useEffect(() => {
    if (isColorThemesError) toast.error('โหลดรายการโทนสีไม่สำเร็จ');
  }, [isColorThemesError]);

  const methods = useForm({
    resolver: zodResolver(JobQueueFormSchema),
    defaultValues: toDefaultValues(currentJob, defaultDate ?? undefined),
  });
  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(toDefaultValues(currentJob, defaultDate ?? undefined));
  }, [currentJob, defaultDate, reset]);

  useEffect(() => {
    const quotationId = currentJob?.quotationId ?? initialQuotationId;
    const contractId = currentJob?.contractId ?? initialContractId;
    const quotation = quotations.find((item) => item.id === quotationId);
    const contract = contracts.find((item) => item.id === contractId);
    const source = quotation ?? contract;

    if (quotation) setValue('quotation', { id: quotation.id, quoteNo: quotation.quoteNo });
    if (contract) setValue('contract', { id: contract.id, contractNo: contract.contractNo });
    if (!currentJob?.customer && source?.customer) {
      setValue('customer', { id: source.customer.id, name: source.customer.name });
    }
  }, [currentJob, initialQuotationId, initialContractId, quotations, contracts, setValue]);

  useEffect(() => {
    if (currentJob?.colorThemeIds?.length && colorThemes.length) {
      setValue(
        'colorThemes',
        colorThemes
          .filter((theme) => currentJob.colorThemeIds.includes(theme.id))
          .map((theme) => ({ id: theme.id, name: theme.name }))
      );
    }
  }, [currentJob, colorThemes, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        quotationId: data.quotation?.id ?? null,
        contractId: data.contract?.id ?? null,
        customerId: data.customer!.id,
        colorThemeId: data.colorThemes[0]?.id ?? null,
        colorThemeIds: data.colorThemes.map((theme) => theme.id),
        title: data.title,
        jobDescription: data.jobDescription,
        jobDate: dayjs(data.jobDate).format('YYYY-MM-DD'),
        startTime: data.startTime ? dayjs(data.startTime).format('HH:mm') : null,
        endTime: data.endTime ? dayjs(data.endTime).format('HH:mm') : null,
        location: data.location,
        status: data.status,
        note: data.note,
      };
      const job = currentJob
        ? await updateMutation.mutateAsync({ id: currentJob.id, input: payload })
        : await createMutation.mutateAsync(payload);
      toast.success(currentJob ? 'แก้ไขคิวงานแล้ว' : 'ลงคิวงานแล้ว');
      router.push(paths.dashboard.jobQueue.details(job.id));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  });

  const handleDelete = async () => {
    if (!currentJob) return;
    try {
      await deleteMutation.mutateAsync(currentJob.id);
      toast.success('ลบคิวงานแล้ว');
      router.push(paths.dashboard.jobQueue.root);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    }
  };

  const cancelPath = currentJob
    ? paths.dashboard.jobQueue.details(currentJob.id)
    : paths.dashboard.jobQueue.root;

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Field.Text name="title" label="ชื่องาน" />
          <Field.Text
            name="jobDescription"
            label="รายละเอียดงาน"
            multiline
            rows={4}
            placeholder="เช่น รูปแบบงาน สิ่งที่ต้องจัดเตรียม หรือรายละเอียดสำหรับทีมงาน"
          />

          <Controller
            name="customer"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                options={customers.map((customer) => ({ id: customer.id, name: customer.name }))}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={field.value}
                onChange={(_event, value) => field.onChange(value)}
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

          <Controller
            name="colorThemes"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={colorThemes.map((item) => ({ id: item.id, name: item.name }))}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={field.value}
                onChange={(_event, value) => field.onChange(value)}
                renderInput={(params) => (
                  <TextField {...params} label="โทนสี" placeholder="เลือกได้มากกว่า 1" />
                )}
              />
            )}
          />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5 }}>
            <Controller
              name="quotation"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={quotations.map((item) => ({ id: item.id, quoteNo: item.quoteNo }))}
                  getOptionLabel={(option) => option.quoteNo}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={field.value}
                  onChange={(_event, value) => {
                    field.onChange(value);
                    const source = quotations.find((item) => item.id === value?.id);
                    if (source?.customer)
                      setValue('customer', { id: source.customer.id, name: source.customer.name });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="อ้างอิงใบเสนอราคา (ถ้ามี)" />
                  )}
                />
              )}
            />
            <Controller
              name="contract"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={contracts.map((item) => ({ id: item.id, contractNo: item.contractNo }))}
                  getOptionLabel={(option) => option.contractNo}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={field.value}
                  onChange={(_event, value) => {
                    field.onChange(value);
                    const source = contracts.find((item) => item.id === value?.id);
                    if (source?.customer)
                      setValue('customer', { id: source.customer.id, name: source.customer.name });
                  }}
                  renderInput={(params) => <TextField {...params} label="อ้างอิงสัญญา (ถ้ามี)" />}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5 }}>
            <Field.DatePicker name="jobDate" label="วันที่" sx={{ flex: 1 }} />
            <Field.Select name="status" label="สถานะ" sx={{ flex: 1 }}>
              {JOB_QUEUE_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5 }}>
            <Field.TimePicker name="startTime" label="เวลาเริ่ม" sx={{ flex: 1 }} />
            <Field.TimePicker name="endTime" label="เวลาสิ้นสุด" sx={{ flex: 1 }} />
          </Box>
          <Field.Text name="location" label="สถานที่" />
          <Field.Text name="note" label="หมายเหตุ" multiline rows={3} />
        </Box>

        <Box sx={{ mt: 4, gap: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          {!!currentJob && (
            <Button
              color="error"
              onClick={handleDelete}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              sx={{ mr: 'auto' }}
            >
              ลบคิวงาน
            </Button>
          )}
          <Button variant="outlined" color="inherit" onClick={() => router.push(cancelPath)}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {currentJob ? 'บันทึกการแก้ไข' : 'ลงคิวงาน'}
          </Button>
        </Box>
      </Card>
    </Form>
  );
}
