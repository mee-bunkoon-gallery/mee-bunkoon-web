import type { IContract } from 'src/types/contract';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import {
  getContract,
  getContracts,
  createContract,
  deleteContract,
  updateContract,
  getContractsPage,
  type ContractInput,
} from './contract-api';

// ----------------------------------------------------------------------

export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (params: unknown) => [...contractKeys.lists(), params] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
};

/** Full unpaginated list — used for dropdown/autocomplete selectors. */
export function useContractsQuery(status?: string) {
  return useQuery({
    queryKey: contractKeys.list({ status }),
    queryFn: () => getContracts(status),
  });
}

export function useContractsPageQuery(params: {
  status?: string;
  page: number;
  rowsPerPage: number;
}) {
  return useQuery({
    queryKey: contractKeys.list(params),
    queryFn: () => getContractsPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useContractQuery(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => getContract(id),
    enabled: !!id,
  });
}

export function useCreateContractMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ContractInput) => createContract(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}

export function useUpdateContractMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ContractInput }) => updateContract(id, input),
    onSuccess: (contract: IContract) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      queryClient.setQueryData(contractKeys.detail(contract.id), contract);
    },
  });
}

export function useDeleteContractMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}
