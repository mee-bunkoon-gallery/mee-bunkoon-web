import type { ICustomer } from 'src/types/quotation';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  getCustomers,
  createCustomer,
  deleteCustomer,
  updateCustomer,
  getCustomersPage,
  type CustomerInput,
} from './customer-api';

// ----------------------------------------------------------------------

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: unknown) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

/** Full unpaginated list — used for dropdown/autocomplete selectors. */
export function useCustomersQuery(q?: string) {
  return useQuery({
    queryKey: customerKeys.list({ q }),
    queryFn: () => getCustomers(q),
  });
}

export function useCustomersPageQuery(params: { q?: string; page: number; rowsPerPage: number }) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => getCustomersPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CustomerInput) => createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CustomerInput }) => updateCustomer(id, input),
    onSuccess: (customer: ICustomer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.setQueryData(customerKeys.detail(customer.id), customer);
    },
  });
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
