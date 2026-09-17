import type { IJobQueue, JobQueueStatus, IJobChecklistItem } from 'src/types/job-queue';

import { apiFetch } from 'src/lib/api-fetch';

// ----------------------------------------------------------------------

export type JobQueueInput = {
  quotationId?: string | null;
  contractId?: string | null;
  customerId: string;
  colorThemeId?: string | null;
  colorThemeIds?: string[];
  title: string;
  jobDescription?: string;
  jobDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string;
  status: JobQueueStatus;
  note?: string;
};

export async function getJobs(filter?: {
  quotationId?: string;
  contractId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<IJobQueue[]> {
  const params = new URLSearchParams();
  if (filter?.quotationId) params.set('quotationId', filter.quotationId);
  if (filter?.contractId) params.set('contractId', filter.contractId);
  if (filter?.dateFrom) params.set('dateFrom', filter.dateFrom);
  if (filter?.dateTo) params.set('dateTo', filter.dateTo);
  const qs = params.toString() ? `?${params.toString()}` : '';

  const { jobs } = await apiFetch<{ jobs: IJobQueue[] }>(`/api/jobs/${qs}`);
  return jobs;
}

export async function getJob(id: string): Promise<IJobQueue> {
  const { job } = await apiFetch<{ job: IJobQueue }>(`/api/jobs/${id}/`);
  return job;
}

export async function createJob(input: JobQueueInput): Promise<IJobQueue> {
  const { job } = await apiFetch<{ job: IJobQueue }>('/api/jobs/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return job;
}

export async function updateJob(id: string, input: JobQueueInput): Promise<IJobQueue> {
  const { job } = await apiFetch<{ job: IJobQueue }>(`/api/jobs/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return job;
}

export async function updateJobChecklist(
  id: string,
  checklist: IJobChecklistItem[]
): Promise<IJobChecklistItem[]> {
  const { checklist: savedChecklist } = await apiFetch<{ checklist: IJobChecklistItem[] }>(
    `/api/jobs/${id}/checklist/`,
    {
      method: 'PUT',
      body: JSON.stringify({ checklist }),
    }
  );

  return savedChecklist;
}

export async function deleteJob(id: string): Promise<void> {
  await apiFetch(`/api/jobs/${id}/`, { method: 'DELETE' });
}
