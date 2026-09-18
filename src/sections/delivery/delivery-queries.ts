import type { IDelivery } from 'src/types/delivery';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  getDelivery,
  getDeliveries,
  createDelivery,
  deleteDelivery,
  updateDelivery,
  getDeliveriesPage,
  type DeliveryInput,
} from './delivery-api';

// ----------------------------------------------------------------------

export const deliveryKeys = {
  all: ['deliveries'] as const,
  lists: () => [...deliveryKeys.all, 'list'] as const,
  list: (params: unknown) => [...deliveryKeys.lists(), params] as const,
  details: () => [...deliveryKeys.all, 'detail'] as const,
  detail: (id: string) => [...deliveryKeys.details(), id] as const,
};

/** Full filtered list — used by document detail pages (deliveries for a quotation/contract). */
export function useDeliveriesQuery(filter?: { quotationId?: string; contractId?: string }) {
  return useQuery({
    queryKey: deliveryKeys.list(filter ?? {}),
    queryFn: () => getDeliveries(filter),
    enabled: !!(filter?.quotationId || filter?.contractId),
  });
}

export function useDeliveriesPageQuery(params: { page: number; rowsPerPage: number }) {
  return useQuery({
    queryKey: deliveryKeys.list(params),
    queryFn: () => getDeliveriesPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useDeliveryQuery(id: string) {
  return useQuery({
    queryKey: deliveryKeys.detail(id),
    queryFn: () => getDelivery(id),
    enabled: !!id,
  });
}

export function useCreateDeliveryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeliveryInput) => createDelivery(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() });
    },
  });
}

export function useUpdateDeliveryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DeliveryInput }) => updateDelivery(id, input),
    onSuccess: (delivery: IDelivery) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() });
      queryClient.setQueryData(deliveryKeys.detail(delivery.id), delivery);
    },
  });
}

export function useDeleteDeliveryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.lists() });
    },
  });
}
