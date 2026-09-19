'use client';

import type { ReactNode } from 'react';
import type { IJobQueue } from 'src/types/job-queue';

import * as z from 'zod';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RiSave3Line,
  RiUser3Line,
  RiCalendarLine,
  RiFileList3Line,
  RiDeleteBin6Fill,
} from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useContractsQuery } from 'src/sections/contract/contract-queries';
import { useCustomersQuery } from 'src/sections/customer/customer-queries';
import { useQuotationsQuery } from 'src/sections/quotation/quotation-queries';
import { useColorThemesQuery } from 'src/sections/color-theme/color-theme-queries';

import { JOB_QUEUE_STATUS_OPTIONS } from './job-queue-status';
import { THAI_PROVINCES } from './thai-provinces';
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
  locationUrl?: string;
  province?: string;
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
  locationUrl: z.union([z.literal(''), z.url({ error: 'ลิงก์สถานที่ไม่ถูกต้อง' })]).optional(),
  province: z.string().optional(),
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
      locationUrl: job.locationUrl ?? '',
      province: job.province ?? '',
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
    locationUrl: '',
    province: '',
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
        locationUrl: data.locationUrl,
        province: data.province,
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
      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
              <SectionHeading
                icon={<RiFileList3Line size={21} />}
                title="ข้อมูลงาน"
                description="ระบุชื่อและรายละเอียดสำหรับทีมงาน"
              />
              <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
              <Stack spacing={2.5}>
                <Field.Text name="title" label="ชื่องาน" required />
                <Field.Text
                  name="jobDescription"
                  label="รายละเอียดงาน"
                  multiline
                  rows={5}
                  placeholder="เช่น รูปแบบงาน สิ่งที่ต้องจัดเตรียม หรือรายละเอียดสำหรับทีมงาน"
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
                        <TextField {...params} label="โทนสี" placeholder="เลือกได้มากกว่า 1 โทน" />
                      )}
                    />
                  )}
                />
              </Stack>
            </Card>

            <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
              <SectionHeading
                icon={<RiUser3Line size={21} />}
                title="ลูกค้าและเอกสารอ้างอิง"
                description="เชื่อมโยงคิวงานกับลูกค้า ใบเสนอราคา หรือสัญญา"
              />
              <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
              <Stack spacing={2.5}>
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
                          required
                          label="ลูกค้า"
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="quotation"
              control={control}
              render={({ field }) => (
                <Autocomplete
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
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="contract"
              control={control}
              render={({ field }) => (
                <Autocomplete
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
                  </Grid>
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: { xs: 2.5, sm: 3 }, position: { lg: 'sticky' }, top: { lg: 24 } }}>
            <SectionHeading
              icon={<RiCalendarLine size={21} />}
              title="กำหนดการ"
              description="วัน เวลา สถานที่ และสถานะของงาน"
            />
            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Stack spacing={2.5}>
              <Field.DatePicker name="jobDate" label="วันที่จัดงาน" />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, lg: 12, xl: 6 }}>
                  <Field.TimePicker name="startTime" label="เวลาเริ่ม" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 12, xl: 6 }}>
                  <Field.TimePicker name="endTime" label="เวลาสิ้นสุด" />
                </Grid>
              </Grid>
              <Field.Select name="status" label="สถานะ">
                {JOB_QUEUE_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.Text name="location" label="สถานที่จัดงาน" />
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
              <Field.Text
                name="locationUrl"
                type="url"
                label="ลิงก์สถานที่"
                placeholder="https://maps.google.com/..."
                helperText="รองรับลิงก์ Google Maps หรือลิงก์แผนที่อื่น"
              />
              <Field.Text name="note" label="หมายเหตุ" multiline rows={3} />
            </Stack>

            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Stack direction={{ xs: 'column-reverse', sm: 'row', lg: 'column-reverse' }} spacing={1.5}>
              <Button fullWidth variant="outlined" color="inherit" onClick={() => router.push(cancelPath)}>
                ยกเลิก
              </Button>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                loading={isSubmitting}
                startIcon={<RiSave3Line />}
              >
                {currentJob ? 'บันทึกการแก้ไข' : 'ลงคิวงาน'}
              </Button>
            </Stack>

            {!!currentJob && (
              <Button
                fullWidth
                color="error"
                onClick={handleDelete}
                startIcon={<RiDeleteBin6Fill />}
                sx={{ mt: 1.5 }}
              >
                ลบคิวงาน
              </Button>
            )}
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}

// ----------------------------------------------------------------------

type SectionHeadingProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function SectionHeading({ icon, title, description }: SectionHeadingProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          display: 'grid',
          borderRadius: 1.5,
          placeItems: 'center',
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
