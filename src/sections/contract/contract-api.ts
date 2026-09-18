import type { IContract, ContractStatus } from 'src/types/contract';

import { apiFetch } from 'src/lib/api-fetch';

// ----------------------------------------------------------------------

export type ContractInput = {
  quotationId?: string | null;
  contractName?: string;
  placeOfExecution?: string;
  customerId: string;
  contractDate: string;
  eventType?: string;
  eventTypeId?: string | null;
  eventDate?: string | null;
  eventTime?: string;
  eventLocation?: string;
  scopeOfWork?: string;
  totalAmount: number;
  depositAmount: number;
  paymentTerms?: string;
  termsConditions?: string;
  status: ContractStatus;
  note?: string;
};

export async function getContracts(status?: string): Promise<IContract[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const { contracts } = await apiFetch<{ contracts: IContract[] }>(`/api/contracts/${qs}`);
  return contracts;
}

export async function getContractsPage(params: {
  status?: string;
  page?: number;
  rowsPerPage?: number;
}): Promise<{ contracts: IContract[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  qs.set('page', String(params.page ?? 0));
  qs.set('rowsPerPage', String(params.rowsPerPage ?? 10));
  return apiFetch<{ contracts: IContract[]; total: number }>(`/api/contracts/?${qs}`);
}

export async function getContract(id: string): Promise<IContract> {
  const { contract } = await apiFetch<{ contract: IContract }>(`/api/contracts/${id}/`);
  return contract;
}

export async function createContract(input: ContractInput): Promise<IContract> {
  const { contract } = await apiFetch<{ contract: IContract }>('/api/contracts/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return contract;
}

export async function updateContract(id: string, input: ContractInput): Promise<IContract> {
  const { contract } = await apiFetch<{ contract: IContract }>(`/api/contracts/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return contract;
}

export async function deleteContract(id: string): Promise<void> {
  await apiFetch(`/api/contracts/${id}/`, { method: 'DELETE' });
}

export async function saveContractSignature(
  id: string,
  signer: 'issuer' | 'customer',
  signature: string
): Promise<string> {
  const { signatureUrl } = await apiFetch<{ signatureUrl: string }>(
    `/api/contracts/${id}/signature/`,
    {
      method: 'POST',
      body: JSON.stringify({ signer, signature }),
    }
  );
  return signatureUrl;
}
