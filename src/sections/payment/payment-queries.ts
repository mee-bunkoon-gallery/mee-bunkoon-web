import type { IPayment } from 'src/types/payment';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  getPayment,
  getPayments,
  createPayment,
  deletePayment,
  updatePayment,
  getPaymentsPage,
  type PaymentInput,
} from './payment-api';

// ----------------------------------------------------------------------

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params: unknown) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

/** Filtered list — used by document detail pages (payments for a quotation/contract). */
export function usePaymentsQuery(filter: { quotationId?: string; contractId?: string }) {
  return useQuery({
    queryKey: paymentKeys.list(filter),
    queryFn: () => getPayments(filter),
    enabled: !!(filter.quotationId || filter.contractId),
  });
}

/** Full unfiltered list — used by the dashboard for aggregate totals. */
export function useAllPaymentsQuery() {
  return useQuery({
    queryKey: paymentKeys.list({}),
    queryFn: () => getPayments(),
  });
}

export function usePaymentsPageQuery(params: { page: number; rowsPerPage: number }) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => getPaymentsPage(params),
    placeholderData: keepPreviousData,
  });
}

export function usePaymentQuery(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => getPayment(id),
    enabled: !!id,
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PaymentInput) => createPayment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

export function useUpdatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PaymentInput }) => updatePayment(id, input),
    onSuccess: (payment: IPayment) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.setQueryData(paymentKeys.detail(payment.id), payment);
    },
  });
}

export function useDeletePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}
