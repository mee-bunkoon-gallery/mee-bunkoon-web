import type { JobQueueStatus } from 'src/types/job-queue';

// ----------------------------------------------------------------------

export const JOB_QUEUE_STATUS_META: Record<
  JobQueueStatus,
  { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error'; hex: string }
> = {
  queued: { label: 'คิวจอง', color: 'default', hex: '#919EAB' },
  confirmed: { label: 'ยืนยันแล้ว', color: 'info', hex: '#00B8D9' },
  in_progress: { label: 'กำลังดำเนินการ', color: 'warning', hex: '#FFAB00' },
  completed: { label: 'เสร็จสิ้น', color: 'success', hex: '#22C55E' },
  cancelled: { label: 'ยกเลิก', color: 'error', hex: '#FF5630' },
};

export const JOB_QUEUE_STATUS_OPTIONS: { value: JobQueueStatus; label: string }[] = [
  { value: 'queued', label: 'คิวจอง' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'completed', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' },
];
