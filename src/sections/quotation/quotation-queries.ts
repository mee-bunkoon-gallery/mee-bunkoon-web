import type { IQuotation } from 'src/types/quotation';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  getQuotation,
  getQuotations,
  createQuotation,
  deleteQuotation,
  updateQuotation,
  getQuotationsPage,
  type QuotationInput,
} from './quotation-api';

// ----------------------------------------------------------------------

export const quotationKeys = {
  all: ['quotations'] as const,
  lists: () => [...quotationKeys.all, 'list'] as const,
  list: (params: unknown) => [...quotationKeys.lists(), params] as const,
  details: () => [...quotationKeys.all, 'detail'] as const,
  detail: (id: string) => [...quotationKeys.details(), id] as const,
};

/** Full unpaginated list — used for dropdown/autocomplete selectors. */
export function useQuotationsQuery(status?: string) {
  return useQuery({
    queryKey: quotationKeys.list({ status }),
    queryFn: () => getQuotations(status),
  });
}

export function useQuotationsPageQuery(params: {
  status?: string;
  page: number;
  rowsPerPage: number;
}) {
  return useQuery({
    queryKey: quotationKeys.list(params),
    queryFn: () => getQuotationsPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useQuotationQuery(id: string) {
  return useQuery({
    queryKey: quotationKeys.detail(id),
    queryFn: () => getQuotation(id),
    enabled: !!id,
  });
}

export function useCreateQuotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: QuotationInput) => createQuotation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
    },
  });
}

export function useUpdateQuotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: QuotationInput }) =>
      updateQuotation(id, input),
    onSuccess: (quotation: IQuotation) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      queryClient.setQueryData(quotationKeys.detail(quotation.id), quotation);
    },
  });
}

export function useDeleteQuotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
    },
  });
}
