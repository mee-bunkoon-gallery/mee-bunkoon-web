import type { IJobQueue, IJobChecklistItem } from 'src/types/job-queue';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getJob,
  getJobs,
  createJob,
  deleteJob,
  updateJob,
  type JobQueueInput,
  updateJobChecklist,
} from './job-queue-api';

// ----------------------------------------------------------------------

export const jobQueueKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobQueueKeys.all, 'list'] as const,
  list: (params: unknown) => [...jobQueueKeys.lists(), params] as const,
  details: () => [...jobQueueKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobQueueKeys.details(), id] as const,
};

export function useJobsQuery(filter?: {
  quotationId?: string;
  contractId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: jobQueueKeys.list(filter ?? {}),
    queryFn: () => getJobs(filter),
  });
}

export function useJobQuery(id: string) {
  return useQuery({
    queryKey: jobQueueKeys.detail(id),
    queryFn: () => getJob(id),
    enabled: !!id,
  });
}

export function useCreateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: JobQueueInput) => createJob(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueueKeys.lists() });
    },
  });
}

export function useUpdateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: JobQueueInput }) => updateJob(id, input),
    onSuccess: (job: IJobQueue) => {
      queryClient.invalidateQueries({ queryKey: jobQueueKeys.lists() });
      queryClient.setQueryData(jobQueueKeys.detail(job.id), job);
    },
  });
}

export function useDeleteJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueueKeys.lists() });
    },
  });
}

export function useUpdateJobChecklistMutation(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checklist: IJobChecklistItem[]) => updateJobChecklist(jobId, checklist),
    onSuccess: (checklist: IJobChecklistItem[]) => {
      queryClient.setQueryData(jobQueueKeys.detail(jobId), (current?: IJobQueue) =>
        current ? { ...current, checklist } : current
      );
    },
  });
}
