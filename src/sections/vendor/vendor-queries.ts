import type { IVendor } from 'src/types/vendor';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  getVendor,
  getVendors,
  createVendor,
  deleteVendor,
  updateVendor,
  getVendorsPage,
  type VendorInput,
} from './vendor-api';

export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (params: unknown) => [...vendorKeys.lists(), params] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

export function useVendorQuery(id: string) {
  return useQuery({ queryKey: vendorKeys.detail(id), queryFn: () => getVendor(id), enabled: !!id });
}

export function useVendorsPageQuery(params: { q: string; page: number; rowsPerPage: number }) {
  return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: () => getVendorsPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useVendorsQuery() {
  return useQuery({ queryKey: vendorKeys.list({ all: true }), queryFn: getVendors });
}

export function useCreateVendorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VendorInput) => createVendor(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorKeys.lists() }),
  });
}

export function useUpdateVendorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VendorInput }) => updateVendor(id, input),
    onSuccess: (vendor: IVendor) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.setQueryData(vendorKeys.detail(vendor.id), vendor);
    },
  });
}

export function useDeleteVendorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorKeys.lists() }),
  });
}
