import type { IServiceItem } from 'src/types/quotation';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  getServiceItems,
  createServiceItem,
  deleteServiceItem,
  updateServiceItem,
  getServiceItemsPage,
  type ServiceItemInput,
} from './service-api';

// ----------------------------------------------------------------------

export const serviceItemKeys = {
  all: ['service-items'] as const,
  lists: () => [...serviceItemKeys.all, 'list'] as const,
  list: (params: unknown) => [...serviceItemKeys.lists(), params] as const,
  details: () => [...serviceItemKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceItemKeys.details(), id] as const,
};

/** Full unpaginated list — used for dropdown/autocomplete selectors. */
export function useServiceItemsQuery(q?: string) {
  return useQuery({
    queryKey: serviceItemKeys.list({ q }),
    queryFn: () => getServiceItems(q),
  });
}

export function useServiceItemsPageQuery(params: {
  q?: string;
  page: number;
  rowsPerPage: number;
}) {
  return useQuery({
    queryKey: serviceItemKeys.list(params),
    queryFn: () => getServiceItemsPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateServiceItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ServiceItemInput) => createServiceItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceItemKeys.lists() });
    },
  });
}

export function useUpdateServiceItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ServiceItemInput }) =>
      updateServiceItem(id, input),
    onSuccess: (serviceItem: IServiceItem) => {
      queryClient.invalidateQueries({ queryKey: serviceItemKeys.lists() });
      queryClient.setQueryData(serviceItemKeys.detail(serviceItem.id), serviceItem);
    },
  });
}

export function useDeleteServiceItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteServiceItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceItemKeys.lists() });
    },
  });
}
