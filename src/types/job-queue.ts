import type { ICustomer } from './quotation';
import type { IColorTheme } from './color-theme';

export type JobQueueStatus = 'queued' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type IJobChecklistItem = {
  id: string;
  label: string;
  detail?: string | null;
  completed: boolean;
};

export type IJobQueue = {
  id: string;
  jobNo: string;
  quotationId: string | null;
  contractId: string | null;
  customerId: string;
  customer?: ICustomer | null;
  colorThemeId: string | null;
  colorTheme?: IColorTheme | null;
  title: string;
  jobDate: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  status: JobQueueStatus;
  note: string | null;
  checklist: IJobChecklistItem[];
  createdAt: string;
  updatedAt: string;
};
